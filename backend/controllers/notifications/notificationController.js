const Notification = require('../../models/notification')

const getAllNotifications = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const notifications = await Notification.getAll()
    res.json(notifications)
}

const getNotificationById = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const notification = await Notification.getById(req.params.id)
    res.json(notification)
}

const getNotificationsByUser = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const notifications = await Notification.getByUser(req.params.id)
    res.json({ notifications })
}

const createNotification = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const { userId, type, title, message } = req.body
    const notification = await Notification.create({ userId, type, title, message })
    res.status(201).json(notification)
}

const updateNotification = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const updated = await Notification.markAsRead(req.params.id)
    res.json(updated)
}

const deleteNotification = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const deleted = await Notification.delete(req.params.id)
    res.json(deleted)
}

module.exports = {
    getAllNotifications,
    getNotificationById,
    getNotificationsByUser,
    createNotification,
    updateNotification,
    deleteNotification
}
