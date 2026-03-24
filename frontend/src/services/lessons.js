import axios from 'axios'
import { getToken } from './authen/login'

const baseUrl = 'http://localhost:3001/api/lessons'

const getConfig = () => ({
	headers: { Authorization: getToken() },
})

const getLessonById = async (lessonId) => {
	const response = await axios.get(`${baseUrl}/${lessonId}`, getConfig())
	return response.data
}

export { getLessonById }
