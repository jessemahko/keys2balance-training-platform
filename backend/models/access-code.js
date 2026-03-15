const { pool } = require('../utils/config')

const findByAccessCode = async (code) => {
	const res = await pool.query(
		`SELECT * FROM access_codes WHERE code = $1 AND is_available = true`,
		[code],
	)
	return res.rows[0] || null
}

const findAll = async () => {
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
	await pool.query(`DELETE FROM access_codes WHERE code_id = $1`, [id])
}

const updateAvailability = async (code) => {
	await pool.query(
		`UPDATE access_codes SET is_available = false WHERE code = $1`,
		[code],
	)
}
module.exports = {
	findByAccessCode,
	findAll,
	create,
	delete: deleteAccessCode,
	updateAvailability,
}

