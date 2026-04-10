const User = require('../../models/user')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const validator = require('validator')
const { isValidPhoneNumber } = require('libphonenumber-js')
const bcrypt = require('bcrypt') // For hashing and comparing passwords

const profileRouter = require('express').Router()

// Ensure the "uploads/avatars" directory exists, if not, create it
const uploadDir = path.join(__dirname, '../../uploads')

// const uploadDir = '/uploads'
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true })
}

// Storage configuration for multer
const storage = multer.diskStorage({
	// Define the destination folder for uploaded files
	destination: uploadDir,
	// Define how to name the uploaded file (using timestamp for uniqueness)
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`)
	},
})

// Initialize multer with the defined storage config
const upload = multer({ storage })

// Profile upload endpoint to handle avatar image uploads
profileRouter.post(
	'/upload-avatar',
	upload.single('avatar'),
	async (req, res) => {
		const userRequest = req.user // Get the user from the request (assumed to be set by authentication middleware)

		// Check if the user is authenticated
		if (!userRequest) {
			return res.status(401).json({ error: 'token invalid' })
		}

		// Find the user in the database using their ID from the token
		const user = await User.findById(userRequest.id)
		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		// Check if a file was uploaded
		if (!req.file) return res.status(400).send('No file uploaded.')

		// If the user already has an avatar, delete the old file
		if (user.avatar_url) {
			const oldAvatarPath = path.join(__dirname, '../../', user.avatar_url) // Get the full path to the old avatar file
			// const oldAvatarPath = user.avatar_url

			if (fs.existsSync(oldAvatarPath)) {
				fs.unlinkSync(oldAvatarPath) // Delete the old avatar
			}
		}

		// Save the new avatar file path in the user document
		const filePath = `/uploads/${req.file.filename}`

		await User.saveImageURL(user.user_id, filePath) // Save the updated user document with the new avatar URL

		// Respond with the URL of the uploaded avatar
		res.json({ avatar_url: filePath })
	},
)

profileRouter.get('/', async (req, res) => {
	const userRequest = req.user
	if (!userRequest) {
		return res.status(401).json({ error: 'token invalid' })
	}
	const safeUser = await User.findMeById(userRequest.id)
	if (!safeUser) {
		return res.status(404).json({ error: 'User not found' })
	}

	res.json({ id: safeUser.user_id, ...safeUser })
})

profileRouter.get('/:userId/', async (req, res) => {
	const requestingUser = req.user
	if (!requestingUser) {
		return res.status(401).json({ error: 'token invalid' })
	}

	const { userId } = req.params
	const user = await User.findMeById(userId)
	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}
	res.json({
		id: user.user_id,
		email: user.email,
		first_name: user.first_name,
		last_name: user.last_name,
		role: user.role,
		avatar_url: user.avatar_url,
		gender: user.gender,
		date_of_birth: user.date_of_birth,
		phone: user.phone,
	})
})

profileRouter.put('/', async (req, res) => {
	const userRequest = req.user
	if (!userRequest) {
		return res.status(401).json({ error: 'token invalid' })
	}
	// Check if the user is authenticated
	// If not, return a 401 Unauthorized response
	const user = await User.findById(userRequest.id)
	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}
	const { first_name, last_name, gender, phone, date_of_birth, email } =
		req.body

	if (email) {
		if (email !== user.email) {
			if (!validator.isEmail(email)) {
				return res.status(400).send({ error: 'Invalid email format' })
			}
			const emailExists = await User.findByEmail(email)
			if (emailExists) {
				return res.status(400).send({ error: 'Email already in use' })
			}

			await User.findByIdAndUpdate(user.user_id, { email, is_verified: false })
			return res.status(204).end()
		} else {
			return res
				.status(400)
				.send({ error: 'Email is the same as the current one' })
		}
	}

	// Validate the input data
	if (!first_name)
		return res.status(400).send({ error: 'First name is required' })
	if (!last_name)
		return res.status(400).send({ error: 'Last name is required' })
	if (phone?.length > 0 && !isValidPhoneNumber(`+${phone}`))
		return res.status(400).send({ error: 'Invalid phone' })

	const d = new Date(date_of_birth)
	const date = date_of_birth && d instanceof Date && !isNaN(d) ? d : null
	await User.findByIdAndUpdate(userRequest.id, {
		first_name,
		last_name,
		gender,
		date_of_birth: date,
		phone: phone?.length > 0 ? phone : null,
	})
	res.status(204).end()
})

profileRouter.put('/password', async (req, res) => {
	const userRequest = req.user
	// Check if the user is authenticated
	// If not, return a 401 Unauthorized response
	if (!userRequest) {
		return res.status(401).json({ error: 'token invalid', success: false })
	}

	const user = await User.findById(userRequest.id)
	if (!user) {
		return res.status(404).json({ error: 'User not found', success: false })
	}

	const { oldPassword, newPassword } = req.body
	if (newPassword.length < 8) {
		return res.status(403).json({
			error: 'new password length must be at least 8',
			success: false,
		})
	}
	if (!/\d/.test(newPassword)) {
		return res.status(403).json({
			error: 'new password must contain at least one number',
			success: false,
		})
	}
	if (!/[A-Z]/.test(newPassword)) {
		return res.status(403).json({
			error: 'new password must contain a capital letter',
			success: false,
		})
	}
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
		return res.status(403).json({
			error: 'new password must contain at least one special character',
			success: false,
		})
	}
	if (/\s/.test(newPassword)) {
		return res.status(403).json({
			error: 'new password must not contain whitespace',
			success: false,
		})
	}

	const passwordCorrect = await bcrypt.compare(oldPassword, user.password_hash)
	if (!passwordCorrect) {
		return res.status(200).json({
			error: 'Incorrect old password',
			success: false,
		})
	}
	const saltRounds = 10
	const password_hash = await bcrypt.hash(newPassword, saltRounds)

	const updatedUser = await User.findByIdAndUpdate(userRequest.id, {
		password_hash,
	})

	if (!updatedUser) {
		return res
			.status(500)
			.json({ error: 'Failed to update password', success: false })
	}
	return res.status(200).json({ success: true })
})

// Export the profileRouter to be used in other parts of the application
module.exports = profileRouter
