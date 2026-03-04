const { pool } = require('../utils/config')

const getThreadsByCourse = async (courseId) => {
    const res = await pool.query(
        'SELECT * FROM discussion_threads WHERE course_id = $1 ORDER BY created_at DESC',
        [courseId]
    )
    return res.rows
}

const createThread = async (courseId, title) => {
    const res = await pool.query(
        'INSERT INTO discussion_threads (course_id, title) VALUES ($1, $2) RETURNING *',
        [courseId, title]
    )
    return res.rows[0]
}

const getMessagesByThread = async (threadId) => {
    const res = await pool.query(
        `SELECT m.*, u.username, u.avatar_url 
         FROM discussion_messages m
         LEFT JOIN users u ON m.user_id = u.user_id
         WHERE m.thread_id = $1 
         ORDER BY m.created_at ASC`,
        [threadId]
    )
    return res.rows
}

const createMessage = async (threadId, userId, messageText) => {
    const res = await pool.query(
        'INSERT INTO discussion_messages (thread_id, user_id, message_text) VALUES ($1, $2, $3) RETURNING *',
        [threadId, userId, messageText]
    )
    return res.rows[0]
}

module.exports = {
    getThreadsByCourse,
    createThread,
    getMessagesByThread,
    createMessage
}