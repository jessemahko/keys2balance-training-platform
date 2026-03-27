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

	const { title } = req.body
	const trimmedTitle = typeof title === 'string' ? title.trim() : ''

	if (!trimmedTitle) {
		return res.status(400).json({ error: 'title is required' })
	}

	const { thread, created } = await Discussion.createThread(
		courseId,
		trimmedTitle,
	)

	if (!thread) {
		return res.status(500).json({ error: 'Unable to create or load thread' })
	}

	res.status(created ? 201 : 200).json(thread)
}

const createMessage = async (req, res) => {
	const { messageText } = req.body
	const trimmedMessage =
		typeof messageText === 'string' ? messageText.trim() : ''

	if (!trimmedMessage) {
		return res.status(400).json({ error: 'message text is required' })
	}

	const { id } = req.params
	if (!id) {
		return res.status(400).json({ error: 'thread id is required' })
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
