// Import necessary modules
const jwt = require('jsonwebtoken') // For generating JSON Web Tokens
const bcrypt = require('bcrypt') // For hashing and comparing passwords
const loginRouter = require('express').Router() // Create a new router instance
const User = require('../models/user') // User model

// Handle login requests
loginRouter.post('/', async (req, res) => {
	const { email, password } = req.body // Extract email and password from request body

	// Find user by email in PostgreSQL
	const user = await User.findByEmail(email)

	// Check if password is correct
	const passwordCorrect =
		user === null ? false : await bcrypt.compare(password, user.passwordHash)

	// Respond with 401 if authentication fails
	if (!(user && passwordCorrect)) {
		return res.status(401).json({
			error: 'invalid email or password',
		})
	}

	// Prepare user data for token
	const userForToken = {
		email: user.email,
		id: user.id,
	}

	// Generate a JSON Web Token with an expiration of 3 days
	const token = jwt.sign(userForToken, process.env.SECRET, {
		expiresIn: 60 * 60 * 24 * 3,
	})

	// Respond with the token and user information
	res.status(200).send({
		token,
		email: user.email,
		role: user.role,
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

