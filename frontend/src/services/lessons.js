import axios from 'axios'
import { getToken } from './authen/login'
import { buildApiUrl } from './apiConfig'

const baseUrl = buildApiUrl('/api/lessons')

const getConfig = () => ({
	headers: { Authorization: getToken() },
})

const getLessonById = async (lessonId) => {
	const response = await axios.get(`${baseUrl}/${lessonId}`, getConfig())
	return response.data
}

const createLesson = async (lessonData) => {
	const response = await axios.post(baseUrl, lessonData, getConfig())
	return response.data
}

const updateLesson = async (id, updates = {}) => {
	// Prefer a single, explicit contract: updates is an object payload.
	// Example: updateLesson(id, { title: "New title" })
	const response = await axios.patch(`${baseUrl}/${id}`, updates, getConfig())
	return response.data
}

const renameLesson = async (id, title) => {
	return updateLesson(id, { title })
}

const deleteLesson = async (id) => {
	const response = await axios.delete(`${baseUrl}/${id}`, getConfig())
	return response.data
}

const addBlock = async (id, blockData) => {
	const response = await axios.patch(
		`${baseUrl}/${id}/add-block`,
		blockData,
		getConfig(),
	)
	return response.data
}

const updateBlock = async (id, blockId, blockData) => {
	const response = await axios.patch(
		`${baseUrl}/${id}/blocks/${blockId}`,
		blockData,
		getConfig(),
	)
	return response.data
}

const deleteBlock = async (id, blockId) => {
	const response = await axios.delete(
		`${baseUrl}/${id}/blocks/${blockId}`,
		getConfig(),
	)
	return response.data
}

export {
	getLessonById,
	createLesson,
	updateLesson,
	renameLesson,
	deleteLesson,
	addBlock,
	updateBlock,
	deleteBlock,
}
