import axios from 'axios'
import { getToken } from './authen/loginn'

const baseUrl = 'http://localhost:3001/api/user/me'

const authConfig = () => ({
	headers: {
		Authorization: getToken(),
	},
})

const getMyProfile = async () => {
	const response = await axios.get(baseUrl, authConfig())
	return response.data
}

const updateMyProfile = async (profileData) => {
	const response = await axios.put(baseUrl, profileData, authConfig())
	return response.data
}

export default { getMyProfile, updateMyProfile }