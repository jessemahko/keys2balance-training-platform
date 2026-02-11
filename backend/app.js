// Import necessary modules and configurations
const config = require('./utils/config')
const express = require('express')
const cors = require('cors') // Cross-Origin Resource Sharing middleware
const path = require('path') // Path module for handling file paths

require('express-async-errors') // Handle async errors automatically
const app = express()

// Import routers and utilities
const middleware = require('./utils/middleware') // Middleware functions

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

