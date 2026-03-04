const Assessment = require('../../models/assessment')

const getAssessments = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	const assessments = await Assessment.getAssessmentsByUser(user.id)
	res.json(assessments)
}

const getAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	const { id } = req.params
	const assessment = await Assessment.getById(id)
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })
	res.json(assessment)
}

const postAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	const { lessonId, title, assessmentJson } = req.body
	const assessment = await Assessment.create({
		lessonId,
		title,
		assessmentJson,
	})
	res.json(assessment)
}

const deleteAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	const { id } = req.params
	const success = await Assessment.deleteById(id)
	if (!success) return res.status(404).json({ error: 'Assessment not found' })
	res.json({ success: true })
}

const updateAssessment = async (req, res) => {
	const user = req.user
	if (!user) return res.status(401).json({ error: 'invalid token' })
	const { id } = req.params
	const { title, assessmentJson } = req.body
	const assessment = await Assessment.updateById(id, { title, assessmentJson })
	if (!assessment)
		return res.status(404).json({ error: 'Assessment not found' })
	res.json(assessment)
}

module.exports = {
	getAssessments,
	getAssessment,
	postAssessment,
	deleteAssessment,
	updateAssessment,
}
