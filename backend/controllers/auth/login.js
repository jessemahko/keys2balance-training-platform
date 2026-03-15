// Import necessary modules
const jwt = require('jsonwebtoken') // For generating JSON Web Tokens
const bcrypt = require('bcrypt') // For hashing and comparing passwords
const loginRouter = require('express').Router() // Create a new router instance

// Import models
const User = require('../../models/user')
const Cohort = require('../../models/cohort')

// Handle login requests
loginRouter.post('/', async (req, res) => {
	// bcrypt.hash('peogway', 10).then(console.log)
	const { email, username, password } = req.body

	// Validate that either email or username is provided along with password
	if (!password || (!email && !username)) {
		return res
			.status(400)
			.json({ error: 'Email or username and password required' })
	}

	const identifier = email || username

	// 1. Check if user exists
	let user = await User.findByEmail(identifier)

	if (!user) {
		user = await User.findByUsername(identifier)
	}

	if (!user) {
		return res.status(401).json({ error: 'Invalid credentials' })
	}

	// 2. Check password
	const passwordCorrect = await bcrypt.compare(password, user.password_hash)
	if (!passwordCorrect) {
		return res.status(401).json({ error: 'Invalid credentials' })
	}

	// // 3. If participant, check cohorts (ensure they are assigned)
	// let cohorts = []
	// if (user.role === 'participant') {
	// 	cohorts = await Cohort.findByUserId(user.id)

	// 	if (!cohorts || cohorts.length === 0) {
	// 		return res.status(400).json({ error: 'Cohort not assigned or invalid' })
	// 	}
	// }

	// 4. Prepare user data for token
	const userData = {
		id: user.user_id,
		email: user.email,
		role: user.role,
	}

	// // Add cohorts only for participants
	// if (user.role === 'participant') {
	// 	userData.cohorts = cohorts.map((c) => c.id) // array of cohort IDs
	// }

	// Generate a JSON Web Token with an expiration of 3 days
	const token = jwt.sign(userData, process.env.SECRET, {
		expiresIn: 60 * 60 * 24 * 3,
	})

	// 5. Respond with token + basic info
	const response = {
		token,
		email: user.email,
		role: user.role,
		name: user.name,
		// username: user.username,
		// name: user.name,
		// avatarUrl: user.avatarUrl,
		// email: user.email,
		// gender: user.gender,
		// dateOfBirth: user.dateOfBirth,
		// phoneNumber: user.phoneNumber,
	}

	// // Add cohorts to response only for participants
	// if (user.role === 'participant') {
	// 	response.cohorts = userData.cohorts
	// }

	res.status(200).json(response)
})

// Export the router
module.exports = loginRouter
