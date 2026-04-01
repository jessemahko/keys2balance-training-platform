import axios from 'axios'
import { buildApiUrl } from '../apiConfig'

const baseUrl = buildApiUrl('/login')
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

const getStoredUser = () => {
	const loggedUserJSON = window.localStorage.getItem('loggedUser')

	if (!loggedUserJSON || loggedUserJSON === 'undefined') {
		if (loggedUserJSON === 'undefined') {
			window.localStorage.removeItem('loggedUser')
		}
		return null
	}

	try {
		return JSON.parse(loggedUserJSON)
	} catch (error) {
		window.localStorage.removeItem('loggedUser')
		return null
	}
}

export { getToken, isTokenExpired, setToken, getStoredUser }
export default { login }
