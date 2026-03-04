const pool = require('../utils/config')

const Notification = {
    async getAll() {
        const query = `
            SELECT *
            FROM notifications
            ORDER BY created_at DESC
        `
        const { rows } = await pool.query(query)
        return rows
    },
    async getById(notificationId) {
        const query = `
            SELECT *
            FROM notifications
            WHERE notification_id = $1
        `
        const { rows } = await pool.query(query, [notificationId])
        return rows[0]
    },
    async getByUser(userId) {
        const query = `
            SELECT *
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
        `
        const { rows } = await pool.query(query, [userId])
        return rows
    },
    async create({ userId, type, title, message }) {
        const query = `
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `
        const { rows } = await pool.query(query, [userId, type, title, message])
        return rows[0]
    },
async markAsRead(notificationId) {
        const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = $1
            RETURNING *
        `
        const { rows } = await pool.query(query, [notificationId])
        return rows[0]
    },
    async delete(notificationId) {
        const query = `
            DELETE FROM notifications
            WHERE notification_id = $1
            RETURNING *
        `
        const { rows } = await pool.query(query, [notificationId])
        return rows[0]
    }
}

module.exports = Notification