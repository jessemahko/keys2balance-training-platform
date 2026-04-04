// Import the application, configuration, and logger modules
const app = require('./app')
const config = require('./utils/config')

// Start the server and listen on the specified port
app.listen(config.PORT, '0.0.0.0', () => {
	console.log(`Server running on port ${config.PORT}`) // Log server start message
})
