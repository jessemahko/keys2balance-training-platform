const express = require('express')
const passport = require('../../utils/passport')
const jwt = require('jsonwebtoken')

const router = express.Router()

// Start Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }))

// Facebook callback
router.get(
	'/facebook/callback',
	passport.authenticate('facebook', {
		session: false,
		failureRedirect: `${process.env.FRONTEND_URL || ''}/auth-failed`,
	}),
	(req, res) => {
		const token = jwt.sign(
			{
				id: req.user.user_id,
				email: req.user.email,
				username: req.user.username,
				role: req.user.role,
				is_verified: req.user.is_verified,
				gender: req.user.gender,
				first_name: req.user.first_name,
				last_name: req.user.last_name,
				date_of_birth: req.user.date_of_birth,
				avatar_url: req.user.avatar_url,
				phone: req.user.phone,
			},
			process.env.SECRET,
			{
				expiresIn: '1h',
			},
		)

		const base = process.env.FRONTEND_URL || ''
		res.redirect(`${base}/auth-success?token=${token}`)
	},
)

module.exports = router

