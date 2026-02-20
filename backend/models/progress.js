const { pool } = require('../utils/config')

const findByUserId = async (userId) => {
  const res = await pool.query(
    'SELECT * FROM progress WHERE user_id = $1',
    [userId]
  )
  return res.rows
}

const createProgress = async ({ moduleId, userId }) => {
  const res = await pool.query(
    `INSERT INTO progress (module_id, user_id) VALUES ($1, $2) RETURNING *`,
    [moduleId, userId]
  )
  return res.rows[0]
}

const updateProgress = async ({ moduleId, userId, isCompleted, completedAt, lastActivityAt }) => {
  const res = await pool.query(
    `UPDATE progress
     SET is_completed = $3, completed_at = $4, last_activity_at = $5
     WHERE module_id = $1 AND user_id = $2
     RETURNING *`,
    [moduleId, userId, isCompleted, completedAt, lastActivityAt]
  )
  return res.rows[0]
}

module.exports = { findByUserId, createProgress, updateProgress }