const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const resetPasswordRouter = require('express').Router()

const User = require('../../models/user')
const sendEmail = require('../../utils/sendEmail')

const validatePassword = (password) => {
	if (!password || password.length < 8)
		return 'Password must be at least 8 characters'
	if (!/\d/.test(password)) return 'Password must contain at least one number'
	if (!/[A-Z]/.test(password)) return 'Password must contain a capital letter'
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
		return 'Password must contain at least one special character'
	if (/\s/.test(password)) return 'Password must not contain whitespace'
	return null
}

resetPasswordRouter.post('/', async (req, res) => {
	const { email } = req.body

	if (!email) {
		return res.status(400).json({ error: 'Email is required' })
	}

	const user = await User.findByEmail(email)

	// Avoid user enumeration: always return success even if email does not exist.
	if (!user) {
		return res.json({
			message: 'If this email exists, a reset link has been sent.',
		})
	}

	const token = jwt.sign(
		{ id: user.user_id, email: user.email, type: 'reset-password' },
		process.env.EMAIL_SECRET || process.env.SECRET,
		{ expiresIn: '1h' },
	)

	const resetLink = `${process.env.FRONTEND_URL}/reset-password/confirm?token=${token}`

	await sendEmail(
		user.email,
		'Reset Your Password',
		`Hello ${user.username},\n\nReset your password by clicking the link below:\n${resetLink}\n\nThis link expires in 1 hour.`,
	)

	return res.json({
		message: 'If this email exists, a reset link has been sent.',
	})
})

resetPasswordRouter.post('/confirm', async (req, res) => {
	const { token, newPassword } = req.body

	if (!token) {
		return res.status(400).json({ error: 'Token is required' })
	}

	const passwordError = validatePassword(newPassword)
	if (passwordError) {
		return res.status(400).json({ error: passwordError })
	}

	let decoded
	try {
		decoded = jwt.verify(token, process.env.EMAIL_SECRET || process.env.SECRET)
	} catch (err) {
		return res
			.status(400)
			.json({ error: 'Invalid or expired token, request a new reset link.' })
	}

	if (!decoded.id || decoded.type !== 'reset-password') {
		return res.status(400).json({ error: 'Invalid token' })
	}

	const user = await User.findById(decoded.id)
	if (!user || user.email !== decoded.email) {
		return res.status(404).json({ error: 'User not found' })
	}

	const passwordHash = await bcrypt.hash(newPassword, 10)
	await User.updateUserPassword(user.user_id, passwordHash)

	return res.json({ message: 'Password has been reset successfully.' })
})

module.exports = resetPasswordRouter

