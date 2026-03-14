const Discussion = require('../../models/discussion')

const getThreads = async (req, res) => {
    const threads = await Discussion.getThreadsByCourse(req.params.courseId)
    res.json(threads)
}

const createThread = async (req, res) => {
    const { title } = req.body
    const trimmedTitle = typeof title === 'string' ? title.trim() : ''

    if (!trimmedTitle) {
        return res.status(400).json({ error: 'title is required' })
    }

    const newThread = await Discussion.createThread(req.params.courseId, trimmedTitle)
    res.status(201).json(newThread)
}

const getMessages = async (req, res) => {
    const messages = await Discussion.getMessagesByThread(req.params.threadId)
    res.json(messages)
}

const createMessage = async (req, res) => {
    const { messageText } = req.body
    const trimmedMessage = typeof messageText === 'string' ? messageText.trim() : ''

    if (!trimmedMessage) {
        return res.status(400).json({ error: 'message text is required' })
    }

    // FIXED: Using req.user.id exactly how it's formatted in the login token
    const newMessage = await Discussion.createMessage(req.params.threadId, req.user.id, trimmedMessage)
    res.status(201).json(newMessage)
}

module.exports = {
    getThreads,
    createThread,
    getMessages,
    createMessage
}