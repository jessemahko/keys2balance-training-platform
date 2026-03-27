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

// Find only participants (for trainers/admins managing course rosters)
const findParticipants = async () => {
	const res = await pool.query(`SELECT * FROM users WHERE role = 'participant'`)
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

const createUserWithOAuth = async ({
	username,
	email,
	password_hash,
	role,
	is_verified,
	first_name,
	last_name,
	gender,
	avatar_url,
	is_login_with_google,
}) => {
	const res = await pool.query(
		`INSERT INTO users (username, email, password_hash, role, is_verified, first_name, last_name, gender, avatar_url, is_login_with_google)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
		[
			username,
			email,
			password_hash,
			role,
			is_verified,
			first_name,
			last_name,
			gender,
			avatar_url,
			is_login_with_google,
		],
	)
	return res.rows[0]
}

const saveImageURL = async (userId, imageUrl) => {
	await pool.query(`UPDATE users SET avatar_url = $1 WHERE user_id = $2`, [
		imageUrl,
		userId,
	])
}

// Find user by id
const findMeById = async (id) => {
	const res = await pool.query(
		`SELECT user_id, username, email, role, is_verified, is_active, gender, first_name, last_name, date_of_birth, avatar_url, phone, address, city, post_code, created_at, updated_at
		FROM users
		WHERE user_id = $1`,
		[id],
	)
	return res.rows[0] || null
}

const findByIdAndUpdate = async (id, updateFields) => {
	const res = await pool.query(
		`UPDATE users SET ${Object.keys(updateFields)
			.map((key, idx) => `${key} = $${idx + 2}`)
			.join(', ')} WHERE user_id = $1 RETURNING *`,
		[id, ...Object.values(updateFields)],
	)
	return res.rows[0] || null
}
module.exports = {
	findById,
	findByEmail,
	findByUsername,
	findByUsernameOrEmail,
	createUser,
	createUserWithOAuth,
	findAll,
	findParticipants,
	verifyEmail,
	deleteById,
	updateUserPassword,
	saveImageURL,
	findMeById,
	findByIdAndUpdate,
}
