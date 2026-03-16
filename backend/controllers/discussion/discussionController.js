const Discussion = require('../../models/discussion')

const getThreads = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { courseId } = req.body
	if (!courseId) {
		return res.status(400).json({ error: 'courseId is required' })
	}
	const threads = await Discussion.getThreadsByCourse(courseId)
	res.json(threads)
}

const createThread = async (req, res) => {
	const { title } = req.body
	const trimmedTitle = typeof title === 'string' ? title.trim() : ''

	if (!trimmedTitle) {
		return res.status(400).json({ error: 'title is required' })
	}

	const newThread = await Discussion.createThread(
		req.params.courseId,
		trimmedTitle,
	)
	res.status(201).json(newThread)
}

const createMessage = async (req, res) => {
	const { messageText } = req.body
	const trimmedMessage =
		typeof messageText === 'string' ? messageText.trim() : ''

	if (!trimmedMessage) {
		return res.status(400).json({ error: 'message text is required' })
	}

	// FIXED: Using req.user.id exactly how it's formatted in the login token
	const newMessage = await Discussion.createMessage(
		req.params.threadId,
		req.user.id,
		trimmedMessage,
	)
	res.status(201).json(newMessage)
}

module.exports = {
	getThreads,
	createThread,
	getMessages,
	createMessage,
}
