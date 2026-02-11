// Import necessary modules
const jwt = require('jsonwebtoken') // For generating JSON Web Tokens
const bcrypt = require('bcrypt') // For hashing and comparing passwords
const loginRouter = require('express').Router() // Create a new router instance

// Import models
const User = require('../models/user')
const Cohort = require('../models/cohort')

// Handle login requests
loginRouter.post('/', async (req, res) => {
	const { email, password } = req.body // Extract email and password from request body

	// 1. Find user by email
	const user = await User.findByEmail(email)
	if (!user) {
		return res.status(401).json({ error: 'Invalid email or password' })
	}

	// 2. Check password
	const passwordCorrect = await bcrypt.compare(password, user.password_hash)
	if (!passwordCorrect) {
		return res.status(401).json({ error: 'Invalid email or password' })
	}

	// 3. If participant, check cohort (optional: ensure they are assigned)
	if (user.role === 'participant') {
		const cohort = await Cohort.findById(user.cohort_id)
		if (!cohort) {
			return res.status(400).json({ error: 'Cohort not assigned or invalid' })
		}
	}

	// 4. Generate JWT
	const userForToken = {
		id: user.id,
		email: user.email,
		role: user.role,
		cohortId: user.cohort_id,
	}

	// Generate a JSON Web Token with an expiration of 3 days
	const token = jwt.sign(userForToken, process.env.SECRET, {
		expiresIn: 60 * 60 * 24 * 3,
	})

	// 5. Respond with token + basic info
	res.status(200).json({
		token,
		email: user.email,
		role: user.role,
		cohortId: user.cohort_id,
		name: user.name,
		// username: user.username,
		// name: user.name,
		// avatarUrl: user.avatarUrl,
		// email: user.email,
		// gender: user.gender,
		// dateOfBirth: user.dateOfBirth,
		// phoneNumber: user.phoneNumber,
	})
})

// Export the router
module.exports = loginRouter

