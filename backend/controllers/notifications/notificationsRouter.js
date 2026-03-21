const router = require('express').Router()
const NotificationController = require('./notificationController')

router.get('/', NotificationController.getAllNotifications)
router.put('/:id', NotificationController.markAsRead)
router.delete('/:id', NotificationController.deleteNotification)

module.exports = router
