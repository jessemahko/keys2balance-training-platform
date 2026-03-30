import axios from 'axios'
import { getToken } from './authen/login'

// const baseUrl = ''
const baseUrl = 'http://localhost:3001'

const updateAvatar = async (pic) => {
	const formData = new FormData()
	formData.append('avatar', pic)
	const config = {
		headers: {
			'Content-Type': 'multipart/form-data',
			Authorization: getToken(),
		},
	}

	const res = await axios.post(
		`${baseUrl}/api/profile/upload-avatar`,
		formData,
		config,
	)
	return res.data
}

const updateProfile = async (data) => {
	const config = {
		headers: {
			Authorization: getToken(),
		},
	}
	const res = await axios.put(`${baseUrl}/api/profile`, data, config)
	return res
}
export const changePassword = async (data) => {
	const config = {
		headers: {
			Authorization: getToken(),
		},
	}
	const res = await axios.put(`${baseUrl}/api/profile/password`, data, config)
	return res.data
}

export const getMe = async (userId) => {
	const config = {
		headers: {
			Authorization: getToken(),
		},
	}
	const res = await axios.get(`${baseUrl}/api/profile`, config)
	return res.data
}

const requestEmailVerification = async () => {
	const config = {
		headers: {
			Authorization: getToken(),
		},
	}
	const res = await axios.post(`${baseUrl}/verify-email`, {}, config)
	return res.data
}

const VerifyEmail = async (token) => {
	const res = await axios.get(`${baseUrl}/verify-email?token=${token}`)
	return res.data
}

export default {
	updateAvatar,
	updateProfile,
	getMe,
	requestEmailVerification,
	VerifyEmail,
}
