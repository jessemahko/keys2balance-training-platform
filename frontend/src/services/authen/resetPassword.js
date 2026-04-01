import axios from 'axios'
import { buildApiUrl } from '../apiConfig'

const baseUrl = buildApiUrl()

const requestResetPassword = async (email) => {
	const res = await axios.post(`${baseUrl}/reset-password`, { email })
	return res.data
}

const confirmResetPassword = async ({ token, newPassword }) => {
	const res = await axios.post(`${baseUrl}/reset-password/confirm`, {
		token,
		newPassword,
	})
	return res.data
}

export default {
	requestResetPassword,
	confirmResetPassword,
}
