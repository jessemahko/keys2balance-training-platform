import axios from 'axios'
import { getToken } from './authen/login'

const baseUrl = 'http://localhost:3001/api/assessments'

const getConfig = () => ({
	headers: { Authorization: getToken() },
})

const getByLesson = async (lessonId) => {
	const response = await axios.get(`${baseUrl}?lessonId=${lessonId}`, getConfig())
	return response.data
}

const getById = async (id) => {
	const response = await axios.get(`${baseUrl}/${id}`, getConfig())
	return response.data
}

const create = async (data) => {
	const response = await axios.post(baseUrl, data, getConfig())
	return response.data
}

const update = async (id, data) => {
	const response = await axios.put(`${baseUrl}/${id}`, data, getConfig())
	return response.data
}

const remove = async (id) => {
	const response = await axios.delete(`${baseUrl}/${id}`, getConfig())
	return response.data
}

const submit = async (id, answers) => {
	const response = await axios.post(`${baseUrl}/${id}/submit`, { answers }, getConfig())
	return response.data
}

const getResults = async (id) => {
	const response = await axios.get(`${baseUrl}/${id}/results`, getConfig())
	return response.data
}

const getMyResult = async (id) => {
	const response = await axios.get(`${baseUrl}/${id}/my-result`, getConfig())
	return response.data
}

const gradeQuestion = async (assessmentId, responseId, questionId, score) => {
	const response = await axios.patch(
		`${baseUrl}/${assessmentId}/responses/${responseId}/grade`,
		{ questionId, score },
		getConfig(),
	)
	return response.data
}

export {
	getByLesson,
	getById,
	create,
	update,
	remove,
	submit,
	getResults,
	getMyResult,
	gradeQuestion,
}
