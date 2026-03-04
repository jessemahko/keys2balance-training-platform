const router = require('express').Router()
const NotificationController = require('./notificationController')

router.get('/', NotificationController.getAllNotifications)
router.get('/user/:id', NotificationController.getNotificationsByUser)
router.get('/:id', NotificationController.getNotificationById)
router.post('/', NotificationController.createNotification)
router.put('/:id', NotificationController.updateNotification)
router.delete('/:id', NotificationController.deleteNotification)

module.exports = router
