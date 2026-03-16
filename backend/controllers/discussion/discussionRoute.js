const router = require('express').Router()
const discussionController = require('./discussionController')

router.get('/', discussionController.getThreads)
router.post('/', discussionController.createThread)
router.post('/:id', discussionController.createMessage)

module.exports = router
