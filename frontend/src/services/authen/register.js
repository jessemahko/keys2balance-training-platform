import axios from 'axios'
import { buildApiUrl } from '../apiConfig'

const baseUrl = buildApiUrl('/register')

const register = async (credentials) => {
	const response = await axios.post(baseUrl, credentials)
	return response.data
}

export default { register }
