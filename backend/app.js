// Import necessary modules and configurations
const config = require('./utils/config')
const express = require('express')
const cors = require('cors') // Cross-Origin Resource Sharing middleware
const passport = require('./utils/passport')

const path = require('path') // Path module for handling file paths

require('express-async-errors') // Handle async errors automatically
const app = express()

// Import routers and utilities
const loginRouter = require('./controllers/auth/login') // Login-related routes
const registerRouter = require('./controllers/auth/register') // Registration-related routes
const resetPasswordRouter = require('./controllers/auth/resetPassword')

const googleAuthRouter = require('./controllers/auth/googleAuth') // Google authentication routes

const coursesRouter = require('./controllers/courses/coursesRoute') // Courses routes
const profileRouter = require('./controllers/user/profileController') // User profile routes
const assessmentRouter = require('./controllers/assessment/assessmentRoute')
const notificationsRouter = require('./controllers/notifications/notificationsRouter')
const discussionRouter = require('./controllers/discussion/discussionRoute') // Discussion routes
const accessCodeRouter = require('./controllers/access-code/accessCodeRoute') // Access code routes
const emailRouter = require('./controllers/email-verify/emailVerifyController') // Email verification routes
const lessonRouter = require('./controllers/lessons/lessonRoute') // Lesson routes

const middleware = require('./utils/middleware') // Middleware functions
const userRouter = require('./controllers/user/userRoute')

console.log('connecting to PostgreSQL')
// Connect to Postgresql
config.pool
	.connect()
	.then(() => {
		console.log('connected to PostgreSQL')
	})
	.catch((error) => {
		console.log('error connecting to PostgreSQL:', error.message)
	})

// Middleware setup
app.use(cors()) // Enable CORS for all routes
app.use(express.json({ limit: '50mb' })) // Parse incoming JSON requests (increased limit for file attachments)
app.use(middleware.tokenExtractor) // Extract token from requests

app.use(passport.initialize()) // Initialize Passport for authentication

// Route handlers

app.use('/login', loginRouter) // Routes for login operations
app.use('/register', registerRouter) // Routes for registration operations
app.use('/reset-password', resetPasswordRouter)

app.use('/auth', googleAuthRouter) // Routes for Google authentication

// Access code routes
app.use(
	'/api/access-codes',
	middleware.userExtractor,
	middleware.authorizeRoles('admin'),
	accessCodeRouter,
)

// Profile routes
app.use('/api/profile', middleware.userExtractor, profileRouter)

// Course routes
app.use(
	'/api/courses',
	middleware.userExtractor,
	middleware.authorizeRoles('admin', 'trainer', 'participant'),
	coursesRouter,
)

app.use('/verify-email', middleware.userExtractor, emailRouter) // Email verification route
app.use(
	'/api/users',
	middleware.userExtractor,
	middleware.authorizeRoles('admin', 'trainer'),
	userRouter,
) // User management routes
app.use(
	'/api/discussions',
	middleware.userExtractor,
	middleware.authorizeRoles('admin', 'trainer', 'participant'),
	discussionRouter,
)
app.use(
	'/api/notifications',
	middleware.userExtractor,
	middleware.authorizeRoles('admin', 'trainer', 'participant'),
	notificationsRouter,
)
app.use(
	'/api/lessons',
	middleware.userExtractor,
	middleware.authorizeRoles('admin', 'trainer', 'participant'),
	lessonRouter,
)
app.use(
	'/api/assessments',
	middleware.userExtractor,
	middleware.authorizeRoles('admin', 'trainer', 'participant'),
	assessmentRouter,
)

app.use('/uploads', express.static('./uploads'))

app.use(express.static('dist')) // Serve static files (JS, CSS, images) from the frontend build
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'dist', 'index.html')) // Serve index.html for all other routes so the SPA handles routing
})

// Enable testing routes in test environment
// if (process.env.NODE_ENV === "test") {
//   const testingRouter = require("./controllers/testing");
//   app.use("/api/testing", testingRouter);
// }

app.use(middleware.unknownEndpoint) // Handle requests to unknown endpoints
app.use(middleware.errorHandler) // Handle application errors

// Export the app for use in other modules
module.exports = app
