const User = require('../../models/user')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const validator = require('validator')
const { isValidPhoneNumber } = require('libphonenumber-js')
const bcrypt = require('bcrypt') // For hashing and comparing passwords

const profileRouter = require('express').Router()

// Ensure the "uploads/avatars" directory exists, if not, create it
const uploadDir = path.join(__dirname, '../../uploads/avatars')
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

			if (fs.existsSync(oldAvatarPath)) {
				fs.unlinkSync(oldAvatarPath) // Delete the old avatar
			}
		}

		// Save the new avatar file path in the user document
		const filePath = `/uploads/avatars/${req.file.filename}`

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
	const user = await User.findById(userRequest.id)
	if (!user) {
		return res.status(404).json({ error: 'User not found' })
	}
	res.json({ id: user.user_id, ...user })
})

// profileRouter.put('/', async (req, res) => {
// 	const userRequest = req.user
// 	if (!userRequest) {
// 		return res.status(401).json({ error: 'token invalid' })
// 	}
// 	// Check if the user is authenticated
// 	// If not, return a 401 Unauthorized response
// 	const user = await User.findById(userRequest.id)
// 	if (!user) {
// 		return res.status(404).json({ error: 'User not found' })
// 	}
// 	const { name, email, gender, phoneNumber, dateOfBirth } = req.body
// 	// Validate the input data
// 	if (!email) return res.status(400).send('Email is required')
// 	if (email?.length > 0 && !validator.isEmail(email))
// 		return res.status(400).send('Invalid email')
// 	if (phoneNumber?.length > 0 && !isValidPhoneNumber(`+${phoneNumber}`))
// 		return res.status(400).send('Invalid phone')

// 	const d = new Date(dateOfBirth)
// 	const date = dateOfBirth && d instanceof Date && !isNaN(d) ? d : null
// 	await User.findByIdAndUpdate(
// 		userRequest.id,
// 		{
// 			name,
// 			email: email?.length > 0 ? email : null,
// 			gender,
// 			dateOfBirth: date,
// 			phoneNumber: phoneNumber?.length > 0 ? phoneNumber : null,
// 		},
// 		{ new: true },
// 	)
// 	res.status(204).end()
// })

// profileRouter.put('/password', async (req, res) => {
// 	const userRequest = req.user
// 	// Check if the user is authenticated
// 	// If not, return a 401 Unauthorized response
// 	if (!userRequest) {
// 		return res.status(401).json({ error: 'token invalid', success: false })
// 	}

// 	const user = await User.findById(userRequest.id)
// 	if (!user) {
// 		return res.status(404).json({ error: 'User not found', success: false })
// 	}

// 	const { oldPassword, newPassword } = req.body
// 	if (newPassword.length < 3) {
// 		return res.status(403).json({
// 			error: 'new password length must be at least 3',
// 			success: false,
// 		})
// 	}
// 	const passwordCorrect = await bcrypt.compare(oldPassword, user.passwordHash)
// 	if (!passwordCorrect) {
// 		return res.status(200).json({
// 			error: 'Incorect old password',
// 		})
// 	}
// 	const saltRounds = 10
// 	const passwordHash = await bcrypt.hash(newPassword, saltRounds)

// 	await User.findByIdAndUpdate(userRequest.id, { passwordHash }, { new: true })

// 	return res.status(200).json({ success: true })
// })

// Export the profileRouter to be used in other parts of the application
module.exports = profileRouter

