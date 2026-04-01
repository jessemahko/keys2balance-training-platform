import axios from 'axios'
import { getToken } from './authen/login'
import { buildApiUrl } from './apiConfig'

const baseUrl = buildApiUrl('/api/users')

const getConfig = () => ({
	headers: { Authorization: getToken() },
})

const getAllUsers = async () => {
	const response = await axios.get(baseUrl, getConfig())
	return response.data
}

export { getAllUsers }
