const { pool } = require('../utils/config')

// Find user by email
const findByEmail = async (email) => {
	const res = await pool.query('SELECT * FROM users WHERE email = $1', [email])
	return res.rows[0] || null
}

// Find user by username
const findByUsername = async (username) => {
	const res = await pool.query('SELECT * FROM users WHERE username = $1', [
		username,
	])
	return res.rows[0] || null
}

// Find user by username OR email
const findByUsernameOrEmail = async (username, email) => {
	const res = await pool.query(
		'SELECT * FROM users WHERE username = $1 OR email = $2',
		[username, email],
	)
	return res.rows[0] || null
}

// Create new user
const createUser = async ({ username, email, passwordHash, role, cohorts }) => {
	const res = await pool.query(
		`INSERT INTO users (username, email, password_hash, role, cohorts)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING *`,
		[username, email, passwordHash, role, cohorts],
	)
	return res.rows[0]
}

// Find all users (for admin)
const findAll = async () => {
	const res = await pool.query(
		'SELECT id, username, email, role, name FROM users',
	)
	return res.rows
}

module.exports = {
	findByEmail,
	findByUsername,
	findByUsernameOrEmail,
	createUser,
	findAll,
}
