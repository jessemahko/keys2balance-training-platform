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
	const { username, email, password } = req.body

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

	// 5. Create user as unverified
	const savedUser = await User.createUser({
		username,
		email,
		passwordHash,
		role: 'trainer',
	})

	// 6. Generate email verification token
	const verificationToken = jwt.sign(
		{ id: savedUser.user_id },
		process.env.EMAIL_SECRET || process.env.SECRET,
		{ expiresIn: '1d' },
	)

	// 7. Send verification email
	const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
	await sendEmail(
		savedUser.email,
		'Verify Your Email',
		`Hello ${savedUser.username},\n\nPlease verify your email to activate your trainer account by clicking the link below:\n${verificationLink}
    \n\nThis link expires in 24 hours.\n\nAfter verification, you can log in and access the trainer dashboard with this account:\nusername: ${savedUser.username}\nemail: ${savedUser.email}\npassword: ${password}`,
	)

	// 8. Respond without password
	res.status(201).json({
		id: savedUser.id,
		username: savedUser.username,
		email: savedUser.email,
		role: savedUser.role,
		message:
			'Trainer created successfully! Please ask them to verify their email.',
	})
}

const updateUserPassword = async (req, res) => {
	const { id } = req.params
	if (!id) {
		return res.status(400).json({ error: 'User id is not valid' })
	}
	const { password } = req.body

	// 1. Password validation (strong)
	const passwordRegex =
		/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
	if (!password || !passwordRegex.test(password)) {
		return res.status(400).json({
			error:
				'password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character',
		})
	}

	const user = await User.findById(id)
	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}

	const passwordHash = await bcrypt.hash(password, 10)
	await User.updateUserPassword(id, passwordHash)
	res.json({ message: 'Password updated successfully' })
}

const deleteUser = async (req, res) => {
	const { id } = req.params
	if (!id) {
		return res.status(400).json({ error: 'User id is not valid' })
	}
	const user = await User.findById(id)
	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}
	await User.deleteById(id)
	res.json({ message: 'User deleted successfully' })
}

const getCurrentUserProfile = async (req, res) => {
	if (!req.user || !req.user.id) {
		return res.status(401).json({ error: 'Authentication required' })
	}

	const user = await User.findById(req.user.id)

	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}

	res.json(user)
}

const updateCurrentUserProfile = async (req, res) => {
	if (!req.user || !req.user.id) {
		return res.status(401).json({ error: 'Authentication required' })
	}

	const updatedUser = await User.updateUserProfile(req.user.id, req.body)

	if (!updatedUser) {
		return res.status(404).json({ error: 'User not found' })
	}

	res.json(updatedUser)
}

module.exports = {
	getUsers,
	createUser,
	deleteUser,
	updateUserPassword,
	getCurrentUserProfile,
	updateCurrentUserProfile,
}