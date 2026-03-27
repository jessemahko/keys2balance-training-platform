const { pool } = require('../utils/config')

const getAll = async () => {
	const query = `
            SELECT *
            FROM notifications
            ORDER BY created_at DESC
        `
	const { rows } = await pool.query(query)
	return rows
}
const getById = async (notificationId) => {
	const query = `
            SELECT *
            FROM notifications
            WHERE notification_id = $1
        `
	const { rows } = await pool.query(query, [notificationId])
	return rows[0]
}
const getByUser = async (userId) => {
	const query = `
            SELECT *
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
        `
	const { rows } = await pool.query(query, [userId])
	return rows
}
const create = async ({ userId, type, title, message }) => {
	const query = `
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `
	const { rows } = await pool.query(query, [userId, type, title, message])
	return rows[0]
}
const markAsRead = async (userId) => {
	const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1 AND is_read = FALSE
            RETURNING *
        `
	const { rows } = await pool.query(query, [userId])
	return rows || []
}
const markAsReadById = async (notificationId) => {
	const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = $1
            RETURNING *
        `
	const { rows } = await pool.query(query, [notificationId])
	return rows[0]
}
const deleteNotification = async (notificationId) => {
	const query = `
            DELETE FROM notifications
            WHERE notification_id = $1
            RETURNING *
        `
	const { rows } = await pool.query(query, [notificationId])
	return rows[0]
}

module.exports = {
	getAll,
	getById,
	getByUser,
	create,
	markAsRead,
	markAsReadById,
	deleteNotification,
}
