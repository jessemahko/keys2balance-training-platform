import axios from 'axios'

// const baseUrl = '/api/auth/register'
const baseUrl = 'http://localhost:3001/register'

const register = async (credentials) => {
	const response = await axios.post(baseUrl, credentials)
	return response.data
}

export default { register }

