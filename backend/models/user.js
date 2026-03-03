const { pool } = require('../utils/config')

const PUBLIC_FIELDS = 'id, username, email, role, name, cohorts'

async function findById(id) {
  const res = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`, [id])
  return res.rows[0] || null
}

// Find user by email
async function findByEmail(email) {
	const res = await pool.query(
		`SELECT ${PUBLIC_FIELDS} FROM users WHERE email = $1`,
		[email],
	)
	return res.rows[0] || null
}

// Find user by username
async function findByUsername(username) {
	const res = await pool.query(
		`SELECT ${PUBLIC_FIELDS} FROM users WHERE username = $1`,
		[username],
	)
	return res.rows[0] || null
}

// Find user by username OR email (exist check)
async function findByUsernameOrEmail(username, email) {
	const res = await pool.query(
		`SELECT id FROM users WHERE username = $1 OR email = $2`,
		[username, email],
	)
	return res.rows[0] || null
}

// Create new user (still insert password_hash, but return public fields only)
async function createUser({ username, email, passwordHash, role, cohorts }) {
	const res = await pool.query(
		`INSERT INTO users (username, email, password_hash, role, cohorts)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING ${PUBLIC_FIELDS}`,
		[username, email, passwordHash, role, cohorts],
	)
	return res.rows[0]
}

// Find all users (for admin)
async function findAll() {
	const res = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users`)
	return res.rows
}

module.exports = {
	findByEmail,
	findByUsername,
	findByUsernameOrEmail,
	createUser,
	findAll,
	findById,
}