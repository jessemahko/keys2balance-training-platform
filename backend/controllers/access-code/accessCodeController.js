const AccessCode = require('../../models/access-code')

// Get all access codes
const getAllAccessCodesAndCleanup = async (req, res) => {
	const accessCodes = await AccessCode.findAllAndCleanup()
	res.json(accessCodes)
}

// Create new access code
const createAccessCode = async (req, res) => {
	const courseId = req.body.courseId
	if (!courseId) {
		return res.status(400).json({ error: 'courseId is required' }) // Validate courseId
	}
	const accessCode = await AccessCode.create(courseId)
	res.json(accessCode)
}

// Delete access code by id
const deleteAccessCode = async (req, res) => {
	const id = req.params.id
	if (!id) {
		return res.status(400).json({ error: 'id is required' }) // Validate id
	}
	await AccessCode.delete(id)
	res.json({ message: 'Access code deleted' })
}

module.exports = {
	getAllAccessCodesAndCleanup,
	createAccessCode,
	deleteAccessCode,
}

