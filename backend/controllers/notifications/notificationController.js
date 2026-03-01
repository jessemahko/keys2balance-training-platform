const Notification = require('../../models/notification')
const getNotifications = async (req, res) => {
    try {
        const userId = req.params.userId
        const notifications = await Notification.getByUser(userId)
        res.status(200).json({ notifications })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
const createNotification = async (req, res) => {
    try {
        const { userId, type, title, message } = req.body
        const notification = await Notification.create({ userId, type, title, message })
        res.status(201).json(notification)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
const markRead = async (req, res) => {
    try {
        const { notificationId } = req.params
        const updated = await Notification.markAsRead(notificationId)
        res.status(200).json(updated)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
}
module.exports = {
    getNotifications,
    createNotification,
    markRead
}