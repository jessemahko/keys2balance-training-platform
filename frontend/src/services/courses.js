import axios from 'axios'

// const baseUrl = '/api/courses'
const baseUrl = 'http://localhost:3001/api/courses'
import { getToken } from './login'

const getAllCourses = async () => {
	const config = {
		headers: { Authorization: getToken() },
	}
	const response = await axios.get(baseUrl, config)
	// console.log(response)

	// console.log(typeof response.data)

	return response.data
}

export { getAllCourses }

