const Assessment = require('../../models/assessment')
const AssessmentResponse = require('../../models/assessment-response')
const Course = require('../../models/courses')
const Lesson = require('../../models/lesson')
const { calculateScore } = require('./scoring')

// GET /api/assessments?lessonId=...
const getAssessments = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })

	const { lessonId } = req.query
	if (!lessonId) return res.status(400).json({ error: 'lessonId is required' })

	const lesson = await Lesson.findById(lessonId)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	const isEnrolled = await Course.findEnrollment(user.id, lesson.course_id)
	const isTeacher = String(course.teacher_id) === String(user.id)
	const isAdmin = user.role === 'admin'

	if (!isEnrolled && !isTeacher && !isAdmin) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

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

	const lesson = await Lesson.findById(assessment.lesson_id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	// If student, also fetch their response
	if (user.role === 'participant') {
		const isEnrolled = await Course.findEnrollment(user.id, lesson.course_id)
		if (!isEnrolled) {
			return res.status(403).json({ error: 'Access denied to this assessment' })
		}

		const response = await AssessmentResponse.getByUserAndAssessment(
			user.id,
			req.params.id,
		)

		return res.json({ ...assessment, my_response: response || null })
	}

	const isTeacher = String(course.teacher_id) === String(user.id)
	const isAdmin = user.role === 'admin'

	if (!isTeacher && !isAdmin) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

	res.json(assessment)
}

// POST /api/assessments
const postAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	if (user.role === 'participant')
		return res
			.status(403)
			.json({ error: 'Only admin/trainer can create assessments' })

	const { lessonId, title, assessmentJson } = req.body
	if (!lessonId || !title || !assessmentJson) {
		return res
			.status(400)
			.json({ error: 'lessonId, title, and assessmentJson are required' })
	}

	const lesson = await Lesson.findById(lessonId)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	const isTeacher = String(course.teacher_id) === String(user.id)
	const isAdmin = user.role === 'admin'

	if (!isTeacher && !isAdmin) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

	const assessment = await Assessment.create({
		lessonId,
		title,
		assessmentJson,
	})
	res.status(201).json(assessment)
}

// PUT /api/assessments/:id
const updateAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	if (user.role === 'participant')
		return res
			.status(403)
			.json({ error: 'Only admin/trainer can update assessments' })

	const { title, assessmentJson } = req.body
	if (!title || !assessmentJson) {
		return res
			.status(400)
			.json({ error: 'title and assessmentJson are required' })
	}

	const foundAssessment = await Assessment.getById(req.params.id)
	if (!foundAssessment)
		return res.status(404).json({ error: 'Assessment not found' })

	const lesson = await Lesson.findById(foundAssessment.lesson_id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	const isTeacher = String(course.teacher_id) === String(user.id)
	const isAdmin = user.role === 'admin'

	if (!isTeacher && !isAdmin) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

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
		return res
			.status(403)
			.json({ error: 'Only admin/trainer can delete assessments' })

	const foundAssessment = await Assessment.getById(req.params.id)
	if (!foundAssessment)
		return res.status(404).json({ error: 'Assessment not found' })

	const lesson = await Lesson.findById(foundAssessment.lesson_id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	const isTeacher = String(course.teacher_id) === String(user.id)
	const isAdmin = user.role === 'admin'

	if (!isTeacher && !isAdmin) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

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

	const lesson = await Lesson.findById(assessment.lesson_id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	const isEnrolled = await Course.findEnrollment(user.id, lesson.course_id)
	if (!isEnrolled) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

	const { answers } = req.body
	if (!answers) return res.status(400).json({ error: 'answers are required' })

	// Calculate score
	const questions = assessment.assessment_json.questions || []
	const { autoScore, maxScore, hasOpenText } = calculateScore(
		questions,
		answers,
	)

	const response = await AssessmentResponse.submit({
		assessmentId: req.params.id,
		userId: user.id,
		answersJson: answers,
		score: autoScore,
		totalQuestions: questions.length,
		maxScore,
		manualScores: {},
		gradingStatus: hasOpenText ? 'pending' : 'complete',
	})

	if (!response)
		return res.status(500).json({ error: 'Failed to submit assessment' })

	res.json({
		...response,
		score: autoScore,
		total_questions: questions.length,
		max_score: maxScore,
		grading_status: hasOpenText ? 'pending' : 'complete',
	})
}

// GET /api/assessments/:id/results  (teacher/admin only)
const getResults = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	if (user.role === 'participant')
		return res
			.status(403)
			.json({ error: 'Only admin/trainer can view results' })

	const assessment = await Assessment.getById(req.params.id)
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })

	const lesson = await Lesson.findById(assessment.lesson_id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	const isTeacher = String(course.teacher_id) === String(user.id)
	const isAdmin = user.role === 'admin'
	if (!isTeacher && !isAdmin) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

	const responses = await AssessmentResponse.getAllByAssessment(req.params.id)
	res.json({ assessment, responses })
}

// GET /api/assessments/:id/my-result  (student sees own result)
const getMyResult = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })

	const assessment = await Assessment.getById(req.params.id)
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })

	const lesson = await Lesson.findById(assessment.lesson_id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	const isEnrolled = await Course.findEnrollment(user.id, lesson.course_id)
	if (!isEnrolled) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

	const response = await AssessmentResponse.getByUserAndAssessment(
		user.id,
		req.params.id,
	)
	if (!response) return res.status(404).json({ error: 'No submission found' })

	res.json(response)
}

// PATCH /api/assessments/:id/responses/:responseId/grade
const gradeOpenText = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	if (user.role === 'participant')
		return res.status(403).json({ error: 'Only admin/trainer can grade' })

	const assessment = await Assessment.getById(req.params.id)
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })

	const lesson = await Lesson.findById(assessment.lesson_id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	const isTeacher = String(course.teacher_id) === String(user.id)
	const isAdmin = user.role === 'admin'
	if (!isTeacher && !isAdmin) {
		return res.status(403).json({ error: 'Access denied to this assessment' })
	}

	const { questionId, score } = req.body
	if (questionId === undefined || score === undefined)
		return res.status(400).json({ error: 'questionId and score are required' })

	const questions = assessment.assessment_json.questions || []
	const question = questions.find((q) => String(q.id) === String(questionId))
	if (!question || (question.type || 'single_choice') !== 'open_text')
		return res.status(400).json({ error: 'Question is not open_text' })

	const maxPoints = question.max_points || 1
	if (score < 0 || score > maxPoints)
		return res
			.status(400)
			.json({ error: `Score must be between 0 and ${maxPoints}` })

	const responseRecord = await AssessmentResponse.getById(req.params.responseId)
	if (!responseRecord)
		return res.status(404).json({ error: 'Response not found' })

	const answersJson = responseRecord.answers_json
	const manualScores = {
		...(answersJson.manual_scores || {}),
		[questionId]: score,
	}

	const openTextQuestions = questions.filter(
		(q) => (q.type || 'single_choice') === 'open_text',
	)
	const allGraded = openTextQuestions.every(
		(q) => manualScores[q.id] !== undefined,
	)

	const manualTotal = Object.values(manualScores).reduce((sum, s) => sum + s, 0)
	const totalScore = (answersJson.score || 0) + manualTotal

	const updated = await AssessmentResponse.updateGrading(
		req.params.responseId,
		{
			manualScores,
			totalScore,
			gradingStatus: allGraded ? 'complete' : 'pending',
		},
	)

	res.json(updated)
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
	gradeOpenText,
}
