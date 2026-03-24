import axios from 'axios'
import { getToken } from './authen/login'

const baseUrl = 'http://localhost:3001/api/users'

const getConfig = () => ({
	headers: { Authorization: getToken() },
})

const getAllUsers = async () => {
	const response = await axios.get(baseUrl, getConfig())
	return response.data
}

export { getAllUsers }
