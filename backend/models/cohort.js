const { pool } = require('../utils/config')

// Find cohort by access code
async function findByAccessCode(accessCode) {
	const res = await pool.query('SELECT * FROM cohorts WHERE access_code = $1', [
		accessCode,
	])
	return res.rows[0] || null
}

// Find cohorts for a given user ID
async function findByUserId(userId) {
	const res = await pool.query(
		`SELECT c.* 
		 FROM cohorts c
		 JOIN user_cohorts uc ON c.id = uc.cohort_id
		 WHERE uc.user_id = $1`,
		[userId],
	)
	return res.rows
}

// Find cohort by ID
async function findById(cohortId) {
	const res = await pool.query('SELECT * FROM cohorts WHERE id = $1', [
		cohortId,
	])
	return res.rows[0] || null
}

// Export functions
module.exports = {
	findByAccessCode,
	findByUserId,
	findById,
}

