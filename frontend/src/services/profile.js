import axios from 'axios'
import { getToken } from './authen/login'

// const baseUrl = '/profile'
const baseUrl = 'http://localhost:3001/api/profile'

const updateAvatar = async (pic) => {
	const formData = new FormData()
	formData.append('avatar', pic)
	const config = {
		headers: {
			'Content-Type': 'multipart/form-data',
			Authorization: getToken(),
		},
	}

	const res = await axios.post(`${baseUrl}/upload-avatar`, formData, config)
	return res.data
}

const updateProfile = async (data) => {
	const config = {
		headers: {
			Authorization: getToken(),
		},
	}
	const res = await axios.put(`${baseUrl}`, data, config)
	return res
}
export const changePassword = async (data) => {
	const config = {
		headers: {
			Authorization: getToken(),
		},
	}
	const res = await axios.put(`${baseUrl}/password`, data, config)
	return res.data
}

export const getMe = async (userId) => {
	const config = {
		headers: {
			Authorization: getToken(),
		},
	}
	const res = await axios.get(`${baseUrl}`, config)
	return res.data
}

export default { updateAvatar, updateProfile, getMe }
