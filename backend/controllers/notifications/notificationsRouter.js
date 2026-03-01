const router = require('express').Router()
const notificationController = require('../../models/notification')

// Get all notifications for a user
router.get('/:userId', async (req, res) => {
    const notifications = await notificationController.getByUser(req.params.userId)
    res.json({ notifications })
})

// Create a notification
router.post('/', async (req, res) => {
    const { userId, type, title, message } = req.body
    const notification = await notificationController.create({ userId, type, title, message })
    res.status(201).json(notification)
})

// Mark as read
router.patch('/:notificationId/read', async (req, res) => {
    const updated = await notificationController.markAsRead(req.params.notificationId)
    res.json(updated)
})

module.exports = router