const { pool } = require('../utils/config')

// Find user by id
const findById = async (id) => {
	const res = await pool.query(`SELECT * FROM users WHERE user_id = $1`, [id])
	return res.rows[0] || null
}

// Find user by email
const findByEmail = async (email) => {
	const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
	return res.rows[0] || null
}

// Find user by username
const findByUsername = async (username) => {
	const res = await pool.query(`SELECT * FROM users WHERE username = $1`, [
		username,
	])
	return res.rows[0] || null
}

// Find user by username OR email (exist check)
const findByUsernameOrEmail = async (username, email) => {
	const res = await pool.query(
		`SELECT user_id FROM users WHERE username = $1 OR email = $2`,
		[username, email],
	)
	return res.rows[0] || null
}

// Create new user (insert password_hash but return public fields only)
const createUser = async ({ username, email, passwordHash, role }) => {
	const res = await pool.query(
		`INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
		[username, email, passwordHash, role],
	)
	return res.rows[0]
}

// Find all users (for admin)
const findAll = async () => {
	const res = await pool.query(`SELECT * FROM users`)
	return res.rows
}

const verifyEmail = async (id) => {
	await pool.query(`UPDATE users SET is_verified = true WHERE user_id = $1`, [
		id,
	])
}

const deleteById = async (id) => {
	await pool.query(`DELETE FROM users WHERE user_id = $1`, [id])
}

const updateUserPassword = async (id, newPasswordHash) => {
	await pool.query(`UPDATE users SET password_hash = $1 WHERE user_id = $2`, [
		newPasswordHash,
		id,
	])
}
const updateUserProfile = async (id, userData) => {
	const {
		first_name,
		last_name,
		gender,
		date_of_birth,
		phone,
		address,
		city,
		post_code,
		country,
	} = userData

	const res = await pool.query(
		`UPDATE users
		 SET first_name = $1,
		     last_name = $2,
		     gender = $3,
		     date_of_birth = $4,
		     phone = $5,
		     address = $6,
		     city = $7,
		     post_code = $8,
		     country = $9
		 WHERE user_id = $10
		 RETURNING *`,
		[
			first_name,
			last_name,
			gender,
			date_of_birth,
			phone,
			address,
			city,
			post_code,
			country,
			id,
		],
	)

	return res.rows[0] || null
}
module.exports = {
	findById,
	findByEmail,
	findByUsername,
	findByUsernameOrEmail,
	createUser,
	findAll,
	verifyEmail,
	deleteById,
	updateUserPassword,
	updateUserProfile,
}