// Import necessary modules and configurations
const config = require('./utils/config')
const express = require('express')
const cors = require('cors') // Cross-Origin Resource Sharing middleware
const path = require('path') // Path module for handling file paths

require('express-async-errors') // Handle async errors automatically
const app = express()

// Import routers and utilities
const loginRouter = require('./controllers/auth/login') // Login-related routes
const registerRouter = require('./controllers/auth/register') // Registration-related routes

// const adminController = require('./controllers/admin/adminController') // Admin routes
// const coursesRouter = require('./controllers/courses/coursesRoute') // Courses routes
// const progressRouter = require('./controllers/progress/progressController') // Progress routes
// const userController = require('./controllers/user/userController') // User routes
// const notificationController = require('./controllers/notifications/notificationController') // Notifications
// const notificationsRouter = require('./controllers/notifications/notificationsRouter')
// const assessmentRouter = require('./controllers/assessment/assessmentRoute') //Assessments

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
app.use(express.json()) // Parse incoming JSON requests
app.use(middleware.tokenExtractor) // Extract token from requests

// Route handlers
app.use('/login', loginRouter) // Routes for login operations
app.use('/register', registerRouter) // Routes for registration operations

// app.use(
//   '/api/admin',
//   middleware.userExtractor,
//   middleware.authorizeRoles('admin'),
//   adminController) // Admin routes
// app.use('/api/courses', coursesRouter)
// app.use('/api/progress', progressRouter)
// app.use(
//   '/api/user',
//   middleware.userExtractor,
//   middleware.authorizeRoles('admin', 'participant'),
//   userController
// )
// app.use(
//   '/api/notifications',
//   middleware.userExtractor,
//   notificationsRouter
// )
// // Notification routes
// app.use(
//   '/api/notifications',
//   middleware.userExtractor, // ensure we have the user
//   notificationController
// )
// //Assessments
//app.use('/api/assessments', middleware.userExtractor, assessmentRouter);

// app.use(express.static('dist')) // Serve static files (JS, CSS, images) from the frontend build
// app.get('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, 'dist', 'index.html')) // Serve index.html for all other routes so the SPA handles routing
// })

// Enable testing routes in test environment
// if (process.env.NODE_ENV === "test") {
//   const testingRouter = require("./controllers/testing");
//   app.use("/api/testing", testingRouter);
// }

app.use(middleware.unknownEndpoint) // Handle requests to unknown endpoints
app.use(middleware.errorHandler) // Handle application errors

// Export the app for use in other modules
module.exports = app
