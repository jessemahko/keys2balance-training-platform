import axios from 'axios'
import { buildApiUrl } from './apiConfig'

const baseUrl = buildApiUrl('/api/courses')
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

const createCourse = async (newCourse) => {
	const response = await axios.post(baseUrl, newCourse, getConfig())
	return response.data
}

const updateCourse = async (courseId, updates) => {
	const response = await axios.put(
		`${baseUrl}/${courseId}`,
		updates,
		getConfig(),
	)
	return response.data
}

const enrollParticipant = async (courseId, userId) => {
	const response = await axios.post(
		`${baseUrl}/${courseId}/enroll`,
		{ userId },
		getConfig(),
	)
	return response.data
}

const removeParticipant = async (courseId, userId) => {
	const response = await axios.delete(
		`${baseUrl}/${courseId}/enroll/${userId}`,
		getConfig(),
	)
	return response.data
}

const deleteCourse = async (courseId) => {
	const response = await axios.delete(`${baseUrl}/${courseId}`, getConfig())
	return response.data
}

export {
	getAllCourses,
	getCourseById,
	createCourse,
	updateCourse,
	enrollParticipant,
	removeParticipant,
	deleteCourse,
}
