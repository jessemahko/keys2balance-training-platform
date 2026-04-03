const jwt = require('jsonwebtoken')

const verifyEmailRouter = require('express').Router()
const User = require('../../models/user')
const sendEmail = require('../../utils/sendEmail') // utility to send emails

verifyEmailRouter.get('/me', async (req, res) => {
	const { token } = req.query
	if (!token) return res.status(400).json({ error: 'token missing' })

	let decoded
	try {
		decoded = jwt.verify(token, process.env.EMAIL_SECRET || process.env.SECRET)
	} catch (err) {
		return res.status(400).json({
			error: 'invalid or expired token, please request verification again',
		})
	}

	if (!decoded.id) return res.status(400).json({ error: 'invalid token' })

	const user = await User.findById(decoded.id)
	if (!user) return res.status(404).json({ error: 'User not found' })

	if (decoded.email !== user.email)
		return res.status(400).json({ error: 'invalid token' })

	await User.verifyEmail(decoded.id)

	res.json({ message: 'Email verified successfully! You can now log in.' })
})

verifyEmailRouter.post('/', async (req, res) => {
	const requestingUser = req.user
	if (!requestingUser) return res.status(401).json({ error: 'Unauthorized' })

	const user = await User.findById(requestingUser.id)
	if (!user) return res.status(404).json({ error: 'User not found' })
	if (user.is_verified)
		return res.status(400).json({ error: 'Email already verified' })

	// Generate email verification token
	const verificationToken = jwt.sign(
		{ id: user.user_id, email: user.email },
		process.env.EMAIL_SECRET || process.env.SECRET,
		{ expiresIn: '1d' },
	)
	const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`

	await sendEmail(
		user.email,
		'Verify Your Email',
		`Hello ${user.username},\n\nPlease verify your email by clicking the link below:\n${verificationLink}\n\nThis link expires in 24 hours.`,
	)

	res.json({ message: 'Verification email sent successfully!' })
})

verifyEmailRouter.post('/resend', async (req, res) => {
	const requestingUser = req.user
	if (!requestingUser) return res.status(401).json({ error: 'Unauthorized' })

	const user = await User.findById(requestingUser.id)
	if (!user) return res.status(404).json({ error: 'User not found' })

	if (user.is_verified)
		return res.status(400).json({ error: 'Email already verified' })

	// Generate email verification token
	const verificationToken = jwt.sign(
		{ id: user.user_id, email: user.email },
		process.env.EMAIL_SECRET || process.env.SECRET,
		{ expiresIn: '1d' },
	)
	const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`

	await sendEmail(
		user.email,
		'Verify Your Email',
		`Hello ${user.username},\n\nPlease verify your email by clicking the link below:\n${verificationLink}\n\nThis link expires in 24 hours.`,
	)

	res.json({ message: 'Verification email sent successfully!' })
})

module.exports = verifyEmailRouter
