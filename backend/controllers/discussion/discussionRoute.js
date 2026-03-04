const router = require('express').Router()
const discussionController = require('./discussionController')

router.get('/course/:courseId', discussionController.getThreads)
router.post('/course/:courseId', discussionController.createThread)
router.get('/thread/:threadId', discussionController.getMessages)
router.post('/thread/:threadId', discussionController.createMessage)

module.exports = router