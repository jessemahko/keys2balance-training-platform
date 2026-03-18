import axios from 'axios'
// const baseUrl = '/login'
const baseUrl = 'http://localhost:3001/login'
let token = null

const setToken = (newToken) => (token = `Bearer ${newToken}`)

const isTokenExpired = (token) => {
	try {
		const payload = JSON.parse(atob(token.split('.')[1])) // Decode JWT payload
		const expiry = payload.exp * 1000 // Convert to milliseconds
		return Date.now() >= expiry
	} catch (error) {
		return true // Treat invalid tokens as expired
	}
}

const login = async (credentials) => {
	const response = await axios.post(baseUrl, credentials)

	return response.data
}

const getToken = () => token

export { getToken, isTokenExpired, setToken }
export default { login }
