const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const crypto = require('crypto')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const User = require('../models/user') // Assuming you have a User model for database operations

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: '/auth/google/callback',
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const existingUser = await User.findByEmail(profile.emails[0].value)
				if (existingUser) {
					return done(null, existingUser)
				}

				let avatarPath = null
				// const avatarUrl = profile.photos?.[0]?.value

				// if (avatarUrl) {
				// 	try {
				// 		const response = await axios.get(avatarUrl, {
				// 			responseType: 'arraybuffer',
				// 		})
				// 		const ext = avatarUrl.split('.').pop().split('?')[0]
				// 		const fileName = `${Date.now()}-${profile.id}.${ext}`
				// 		avatarPath = path.join(__dirname, '../../uploads/avatars', fileName)
				// 		fs.writeFileSync(avatarPath, response.data)
				// 	} catch (err) {
				// 		console.error('Failed to download avatar:', err)
				// 	}
				// }

				let baseUsername = profile.displayName.replace(/\s+/g, '').toLowerCase()
				let username = baseUsername
				let suffix = 1

				while (await User.findByUsername(username)) {
					username = `${baseUsername}${suffix}`
					suffix++
				}
				const randomPassword = crypto.randomBytes(32).toString('hex')
				const user = {
					username: username,
					email: profile.emails[0].value,
					password_hash: randomPassword, // Store the random password hash (not used for login)
					is_verified: true, // Mark as verified since it's from Google
					role: 'participant', // Default role for new users
					first_name: profile.name.givenName || '',
					last_name: profile.name.familyName || '',
					gender: profile.gender || '',
					avatar_url: avatarPath || '',
				}
				const newUser = await User.createUserWithGoogle(user) // Save the new user to the database

				done(null, newUser)
			} catch (error) {
				return done(error, null)
			}
		},
	),
)

module.exports = passport

