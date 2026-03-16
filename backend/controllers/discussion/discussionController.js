const Discussion = require('../../models/discussion')
const Course = require('../../models/courses')

const getThreads = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { courseId } = req.body
	if (!courseId) {
		return res.status(400).json({ error: 'courseId is required' })
	}

	const enrollment = await Course.findEnrollment(user.id, courseId)
	if (!enrollment) {
		return res
			.status(403)
			.json({ error: 'Forbidden: Not enrolled in this course' })
	}

	const threads = await Discussion.getThreadsByCourse(courseId)
	res.json(threads)
}

const createThread = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { courseId } = req.body
	if (!courseId) {
		return res.status(400).json({ error: 'courseId is required' })
	}

	const enrollment = await Course.findEnrollment(user.id, courseId)
	if (!enrollment) {
		return res
			.status(403)
			.json({ error: 'Forbidden: Not enrolled in this course' })
	}

	const { title } = req.body
	const trimmedTitle = typeof title === 'string' ? title.trim() : ''

	if (!trimmedTitle) {
		return res.status(400).json({ error: 'title is required' })
	}

	const newThread = await Discussion.createThread(courseId, trimmedTitle)
	res.status(201).json(newThread)
}

const createMessage = async (req, res) => {
	const { message } = req.body
	const trimmedMessage = typeof message === 'string' ? message.trim() : ''

	if (!trimmedMessage) {
		return res.status(400).json({ error: 'message text is required' })
	}

	const user = req.user
	const { id } = req.params
	if (!id) {
		return res.status(400).json({ error: 'thread id is required' })
	}

	const thread = await Discussion.findThreadById(id)
	if (!thread) {
		return res.status(404).json({ error: 'Thread not found' })
	}

	const enrollment = await Course.findEnrollment(user.id, thread.course_id)
	if (!enrollment) {
		return res
			.status(403)
			.json({ error: 'Forbidden: Not enrolled in this course' })
	}

	// FIXED: Using req.user.id exactly how it's formatted in the login token
	const newMessage = await Discussion.createMessage(
		id,
		req.user.id,
		trimmedMessage,
	)
	res.status(201).json(newMessage)
}

module.exports = {
	getThreads,
	createThread,
	createMessage,
}
