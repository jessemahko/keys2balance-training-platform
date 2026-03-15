const User = require('../../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendEmail = require('../../utils/sendEmail') // utility to send emails

// Admin: GET /api/user
const getUsers = async (req, res) => {
	const users = await User.findAll()
	res.json(users)
}

// Admin: POST /api/user
const createUser = async (req, res) => {
	const { username, email, password, rePassword, accessCode } = req.body

	// 1. Password validation (strong)
	const passwordRegex =
		/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
	if (!password || !passwordRegex.test(password)) {
		return res.status(400).json({
			error:
				'password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character',
		})
	}

	// 2. Check if passwords match
	if (password !== rePassword) {
		return res.status(400).json({ error: 'passwords do not match' })
	}

	// 3. Validate email (regex) and username
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!email || !emailRegex.test(email)) {
		return res.status(400).json({ error: 'email not valid' })
	}
	if (!username || username.length < 3) {
		return res.status(400).json({ error: 'username too short' })
	}

	// 4. Check if user already exists
	const existingUser = await User.findByUsernameOrEmail(username, email)
	if (existingUser) {
		const message =
			existingUser.username === username
				? 'username already exists'
				: 'email already exists'
		return res.status(409).json({ error: message })
	}

	// 5. Hash password
	const passwordHash = await bcrypt.hash(password, 10)

	// 6. Create user as unverified
	const savedUser = await User.createUser({
		username,
		email,
		passwordHash,
		role: 'trainer',
	})

	// 7. Generate email verification token
	const verificationToken = jwt.sign(
		{ id: savedUser.user_id },
		process.env.EMAIL_SECRET || process.env.SECRET,
		{ expiresIn: '1d' },
	)

	// 8. Send verification email
	const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
	await sendEmail(
		savedUser.email,
		'Verify Your Email',
		`Hello ${savedUser.username},\n\nPlease verify your email to activate your trainer account by clicking the link below:\n${verificationLink}
    \n\nThis link expires in 24 hours.\n\nAfter verification, you can log in and access the trainer dashboard with this account:\nusername: ${savedUser.username}\nemail: ${savedUser.email}\npassword: ${password}`,
	)

	// 9. Respond without password
	res.status(201).json({
		id: savedUser.id,
		username: savedUser.username,
		email: savedUser.email,
		role: savedUser.role,
		message:
			'Trainer created successfully! Please ask them to verify their email.',
	})
}

module.exports = {
	getUsers,
	createUser,
}
