const router = require('express').Router()
const NotificationController = require('./notificationController')

router.get('/', NotificationController.getAllNotifications)
router.put('/', NotificationController.updateNotification)
router.delete('/:id', NotificationController.deleteNotification)

module.exports = router
