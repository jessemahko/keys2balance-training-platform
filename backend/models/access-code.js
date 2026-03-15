const { pool } = require('../utils/config')

const findAllAndCleanup = async () => {
	await pool.query(`
		DELETE FROM access_codes
		WHERE available = true
		OR created_at < NOW() - INTERVAL '1 day'
	`)
	const res = await pool.query(`SELECT * FROM access_codes`)
	return res.rows
}

const create = async (courseId) => {
	const res = await pool.query(
		`INSERT INTO access_codes (course_id) VALUES ($1) RETURNING *`,
		[courseId],
	)
	return res.rows[0]
}

const deleteAccessCode = async (id) => {
	await pool.query(`DELETE FROM access_codes WHERE id = $1`, [id])
}

module.exports = {
	findAllAndCleanup,
	create,
	delete: deleteAccessCode,
}

