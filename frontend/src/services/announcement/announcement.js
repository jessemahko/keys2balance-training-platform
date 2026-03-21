import axios from 'axios'
import { getToken } from '../authen/login'
const base_URL = 'http://localhost:3001/api/notifications'

const getAllNotifications = async () => {
	const config = { headers: { Authorization: getToken() } }
	const res = await axios.get(base_URL, config)
	return res.data
}

const markAsRead = async (id) => {
	const config = { headers: { Authorization: getToken() } }
	const res = await axios.put(`${base_URL}/${id}`, {}, config)
	return res.data
}

const deleteNotification = async (id) => {
	const config = { headers: { Authorization: getToken() } }
	const res = await axios.delete(`${base_URL}/${id}`, config)
	return res.data
}

export default { getAllNotifications, markAsRead, deleteNotification }
