const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const axios = require('axios')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const User = require('../models/user') // Assuming you have a User model for database operations

// Google OAuth Strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: `${process.env.FRONTEND_URL}/auth/google/callback`,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const existingUser = await User.findByEmail(profile.emails[0].value)
				if (existingUser) {
					return done(null, existingUser)
				}

				let avatarPath = null
				const avatarUrl = profile.photos?.[0]?.value

				if (avatarUrl) {
					try {
						const response = await axios.get(avatarUrl, {
							responseType: 'arraybuffer',
						})

						const contentType = response.headers['content-type']
						let ext = '.jpg'
						if (contentType === 'image/png') ext = '.png'
						if (contentType === 'image/webp') ext = '.webp'
						const hash = crypto
							.createHash('md5')
							.update(avatarUrl)
							.digest('hex')
						const fileName = `${Date.now()}-${hash}${ext}`

						const fullPath = path.join(__dirname, '../uploads', fileName)

						fs.writeFileSync(fullPath, response.data)

						avatarPath = `/uploads/${fileName}`
					} catch (err) {
						console.error('Failed to download avatar:', err)
					}
				}

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
					is_login_with_google: true, // Custom field to indicate Google login
				}
				const newUser = await User.createUserWithOAuth(user) // Save the new user to the database

				done(null, newUser)
			} catch (error) {
				return done(error, null)
			}
		},
	),
)

module.exports = passport
