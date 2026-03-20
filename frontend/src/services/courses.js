import axios from 'axios'

// const baseUrl = '/api/courses'
const baseUrl = 'http://localhost:3001/api/courses'
import { getToken } from './authen/login'

const getConfig = () => ({
	headers: { Authorization: getToken() },
})

const getAllCourses = async () => {
	const response = await axios.get(baseUrl, getConfig())
	return response.data
}

const getCourseById = async (courseId) => {
	const response = await axios.get(`${baseUrl}/${courseId}`, getConfig())
	return response.data
}

export { getAllCourses, getCourseById }
