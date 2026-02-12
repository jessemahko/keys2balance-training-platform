// Import necessary modules
const bcrypt = require('bcrypt') // For hashing passwords
const jwt = require('jsonwebtoken') // For email verification token
const registerRouter = require('express').Router()
const User = require('../models/user')
const Cohort = require('../models/cohort')
const sendEmail = require('../../utils/sendEmail') // utility to send emails

// Handle participant registration
registerRouter.post('/', async (req, res) => {
	const { username, email, password, accessCode } = req.body

	// 1. Password validation (strong)
	const passwordRegex =
		/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
	if (!password || !passwordRegex.test(password)) {
		return res.status(400).json({
			error:
				'password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character',
		})
	}

	// 2. Validate email (regex) and username
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!email || !emailRegex.test(email)) {
		return res.status(400).json({ error: 'email not valid' })
	}
	if (!username || username.length < 3) {
		return res.status(400).json({ error: 'username too short' })
	}

	// 3. Check if user already exists
	const existingUser = await User.findByUsernameOrEmail(username, email)
	if (existingUser) {
		const message =
			existingUser.username === username
				? 'username already exists'
				: 'email already exists'
		return res.status(409).json({ error: message })
	}

	// 4. Hash password
	const passwordHash = await bcrypt.hash(password, 10)

	// 5. Handle cohort assignment
	if (!accessCode) return res.status(400).json({ error: 'access code missing' })
	const cohort = await Cohort.findByAccessCode(accessCode)
	if (!cohort) return res.status(400).json({ error: 'invalid access code' })
	const cohorts = [cohort.id]

	// 6. Create user as unverified
	const savedUser = await User.createUser({
		username,
		email,
		passwordHash,
		role: 'participant',
		cohorts,
		is_verified: false,
	})

	// 7. Generate email verification token
	const verificationToken = jwt.sign(
		{ id: savedUser.id },
		process.env.EMAIL_SECRET || process.env.SECRET,
		{ expiresIn: '1d' },
	)

	// 8. Send verification email
	const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
	await sendEmail(
		savedUser.email,
		'Verify Your Email',
		`Hello ${savedUser.username},\n\nPlease verify your email by clicking the link below:\n${verificationLink}\n\nThis link expires in 24 hours.`,
	)

	// 9. Respond without password
	res.status(201).json({
		id: savedUser.id,
		username: savedUser.username,
		email: savedUser.email,
		role: savedUser.role,
		cohorts: savedUser.cohorts,
		message:
			'Registration successful! Please check your email to verify your account.',
	})
})

module.exports = registerRouter

