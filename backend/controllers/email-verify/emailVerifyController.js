const jwt = require('jsonwebtoken')

const verifyEmailRouter = require('express').Router()
const User = require('../../models/user')

verifyEmailRouter.get('/', async (req, res) => {
	const { token } = req.query
	if (!token) return res.status(400).json({ error: 'token missing' })

	let decoded
	try {
		decoded = jwt.verify(token, process.env.EMAIL_SECRET || process.env.SECRET)
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			const id = jwt.decode(token)?.id
			if (id) await User.deleteById(id)
		}
		return res
			.status(400)
			.json({ error: 'invalid or expired token, please register again' })
	}

	if (!decoded.id) return res.status(400).json({ error: 'invalid token' })

	const user = await User.findById(decoded.id)
	if (!user) return res.status(404).json({ error: 'User not found' })

	await User.verifyEmail(decoded.id)

	res.json({ message: 'Email verified successfully! You can now log in.' })
})
module.exports = verifyEmailRouter

