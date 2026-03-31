const Assessment = require('../../models/assessment')
const AssessmentResponse = require('../../models/assessment-response')

// GET /api/assessments?lessonId=...
const getAssessments = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })

	const { lessonId } = req.query
	if (!lessonId) return res.status(400).json({ error: 'lessonId is required' })

	const assessments = await Assessment.getByLesson(lessonId)
	res.json(assessments)
}

// GET /api/assessments/:id
const getAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })

	const assessment = await Assessment.getById(req.params.id)
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })

	// If student, also fetch their response
	if (user.role === 'participant') {
		const response = await AssessmentResponse.getByUserAndAssessment(
			user.id,
			req.params.id,
		)
		return res.json({ ...assessment, my_response: response || null })
	}

	res.json(assessment)
}

// POST /api/assessments
const postAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	if (user.role === 'participant')
		return res.status(403).json({ error: 'Only admin/trainer can create assessments' })

	const { lessonId, title, assessmentJson } = req.body
	if (!lessonId || !title || !assessmentJson) {
		return res.status(400).json({ error: 'lessonId, title, and assessmentJson are required' })
	}

	const assessment = await Assessment.create({ lessonId, title, assessmentJson })
	res.status(201).json(assessment)
}

// PUT /api/assessments/:id
const updateAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	if (user.role === 'participant')
		return res.status(403).json({ error: 'Only admin/trainer can update assessments' })

	const { title, assessmentJson } = req.body
	const assessment = await Assessment.updateById(req.params.id, {
		title,
		assessmentJson,
	})
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })
	res.json(assessment)
}

// DELETE /api/assessments/:id
const deleteAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	if (user.role === 'participant')
		return res.status(403).json({ error: 'Only admin/trainer can delete assessments' })

	const deleted = await Assessment.deleteById(req.params.id)
	if (!deleted) return res.status(404).json({ error: 'Assessment not found' })
	res.json({ success: true })
}

// POST /api/assessments/:id/submit
const submitAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })

	const assessment = await Assessment.getById(req.params.id)
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })

	const { answers } = req.body
	if (!answers) return res.status(400).json({ error: 'answers are required' })

	// Calculate score
	const questions = assessment.assessment_json.questions || []
	let correctCount = 0
	for (const q of questions) {
		if (answers[q.id] === q.correct) {
			correctCount++
		}
	}

	const response = await AssessmentResponse.submit({
		assessmentId: req.params.id,
		userId: user.id,
		answersJson: answers,
		score: correctCount,
		totalQuestions: questions.length,
	})

	res.json({
		...response,
		score: correctCount,
		total_questions: questions.length,
	})
}

// GET /api/assessments/:id/results  (teacher/admin only)
const getResults = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	if (user.role === 'participant')
		return res.status(403).json({ error: 'Only admin/trainer can view results' })

	const assessment = await Assessment.getById(req.params.id)
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })

	const responses = await AssessmentResponse.getAllByAssessment(req.params.id)
	res.json({ assessment, responses })
}

// GET /api/assessments/:id/my-result  (student sees own result)
const getMyResult = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })

	const response = await AssessmentResponse.getByUserAndAssessment(
		user.id,
		req.params.id,
	)
	if (!response) return res.status(404).json({ error: 'No submission found' })

	res.json(response)
}

module.exports = {
	getAssessments,
	getAssessment,
	postAssessment,
	deleteAssessment,
	updateAssessment,
	submitAssessment,
	getResults,
	getMyResult,
}
