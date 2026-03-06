const Notification = require('../../models/notification')

const getAllNotifications = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const userId = user.id
    const notifications = await Notification.getByUser(userId)
    res.json(notifications)
}

const updateNotification = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const notification = await Notification.getById(req.params.id)
    if (!notification) {
        return res.status(404).json({ error: 'notification not found' })
    }
    
    if (notification.user_id !== user.id) {
        return res.status(403).json({ error: 'not authorized' })
    }
    
    const updated = await Notification.markAsRead(req.params.id)
    res.json(updated)
}

const deleteNotification = async (req, res) => {
    const user = req.user
    if (!user) return res.status(401).json({ error: 'invalid token' })
    
    const notification = await Notification.getById(req.params.id)
    if (!notification) {
        return res.status(404).json({ error: 'notification not found' })
    }
    
    if (notification.user_id !== user.id) {
        return res.status(403).json({ error: 'not authorized' })
    }
    
    const deleted = await Notification.delete(req.params.id)
    res.json(deleted)
}

module.exports = {
    getAllNotifications,
    updateNotification,
    deleteNotification
}
