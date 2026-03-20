const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy

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
				const newUser = await User.createUserWithOAuth(user) // Save the new user to the database

				done(null, newUser)
			} catch (error) {
				return done(error, null)
			}
		},
	),
)

passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: '/auth/facebook/callback',
			profileFields: ['id', 'emails', 'name', 'gender', 'picture.type(large)'], // request necessary fields
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const email = profile.emails?.[0]?.value
				if (!email) return done(new Error('Facebook email not provided'), null)

				const existingUser = await User.findByEmail(email)
				if (existingUser) {
					return done(null, existingUser)
				}

				// Download avatar
				let avatarPath = ''
				// const avatarUrl = profile.photos?.[0]?.value
				// if (avatarUrl) {
				// 	try {
				// 		const response = await axios.get(avatarUrl, {
				// 			responseType: 'arraybuffer',
				// 		})
				// 		const ext = avatarUrl.split('.').pop().split('?')[0]
				// 		const fileName = `${Date.now()}-${profile.id}.${ext}`
				// 		const uploadDir = path.join(__dirname, '../../uploads/avatars')
				// 		if (!fs.existsSync(uploadDir))
				// 			fs.mkdirSync(uploadDir, { recursive: true })
				// 		avatarPath = path.join(uploadDir, fileName)
				// 		fs.writeFileSync(avatarPath, response.data)
				// 	} catch (err) {
				// 		console.error('Failed to download avatar:', err)
				// 	}
				// }

				// Generate unique username
				let baseUsername =
					`${profile.name.givenName || ''}${profile.name.familyName || ''}`
						.replace(/\s+/g, '')
						.toLowerCase()
				let username = baseUsername
				let suffix = 1
				while (await User.findByUsername(username)) {
					username = `${baseUsername}${suffix}`
					suffix++
				}

				// Random password for OAuth
				const randomPassword = crypto.randomBytes(32).toString('hex')

				const user = {
					username,
					email,
					password_hash: randomPassword, // not used for login
					is_verified: true,
					role: 'participant',
					first_name: profile.name.givenName || '',
					last_name: profile.name.familyName || '',
					gender: profile.gender || '',
					avatar_url: avatarPath
						? `/uploads/avatars/${path.basename(avatarPath)}`
						: '',
				}

				const newUser = await User.createUserWithOAuth(user) // reuse your DB method

				done(null, newUser)
			} catch (error) {
				return done(error, null)
			}
		},
	),
)

module.exports = passport

