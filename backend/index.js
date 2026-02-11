// Import the application, configuration, and logger modules
const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')

// Start the server and listen on the specified port
app.listen(config.PORT, () => {
	logger.info(`Server running on port ${config.PORT}`) // Log server start message
})

