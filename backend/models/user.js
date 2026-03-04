const { pool } = require('../utils/config')

// Find user by id
const findById = async (id) => {
  const res = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`, [id])
  return res.rows[0] || null
}

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

// Create new user (insert password_hash but return public fields only)
const createUser = async ({ username, email, passwordHash, role, cohorts }) => {
  const res = await pool.query(
    `INSERT INTO users (username, email, password_hash, role, cohorts)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${PUBLIC_FIELDS}`,
    [username, email, passwordHash, role, cohorts]
  )
  return res.rows[0]
}

// Find all users (for admin)
const findAll = async () => {
  const res = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users`)
  return res.rows
}

module.exports = {
  findById,
  findByEmail,
  findByUsername,
  findByUsernameOrEmail,
  createUser,
  findAll,
}