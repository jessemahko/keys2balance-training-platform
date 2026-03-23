import axios from 'axios'
import { getToken } from './authen/login'

const baseUrl = 'http://localhost:3001/api/discussions'

const getConfig = () => ({
	headers: { Authorization: getToken() },
})

const getThreads = async (courseId) => {
	const response = await axios.get(`${baseUrl}?courseId=${courseId}`, getConfig())
	return response.data
}

const createThread = async (courseId, title) => {
	const response = await axios.post(baseUrl, { courseId, title }, getConfig())
	return response.data
}

const createMessage = async (threadId, message) => {
	const response = await axios.post(`${baseUrl}/${threadId}`, { message }, getConfig())
	return response.data
}

export { getThreads, createThread, createMessage }
