require('dotenv').config()
const { Pool } = require('pg')

// Set the port value from the environment variable or fallback to a default
const PORT = process.env.PORT || 3001

// Define the PostgreSQL connection string based on environment
const DATABASE_URL =
	process.env.NODE_ENV === 'test'
		? process.env.TEST_DATABASE_URL // Use test DB in test environment
		: process.env.DATABASE_URL // Use production DB otherwise

// Create a pool for PostgreSQL connections
const pool = new Pool({
	connectionString: DATABASE_URL,
})

module.exports = {
	PORT,
	pool,
}

