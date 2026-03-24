import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { rmUserFn } from './userReducer'
import { getAllCourses, createCourse, updateCourse } from '../services/courses'

const initialState = []

const coursesSlice = createSlice({
	name: 'courses',
	initialState: initialState,
	reducers: {
		setCourses(state, action) {
			return action.payload
		},
		appendCourse(state, action) {
			state.push(action.payload)
		},
		updateCourseAction(state, action) {
			return state.map((c) =>
				c.course_id === action.payload.course_id ? action.payload : c,
			)
		},
	},
})

export const { setCourses, appendCourse, updateCourseAction } = coursesSlice.actions

export const setCoursesFn = () => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}

		const courses = await getAllCourses()
		dispatch(setCourses(courses))
	}
}

export const createCourseFn = (courseData) => {
	return async (dispatch) => {
		const newCourse = await createCourse(courseData)
		dispatch(appendCourse(newCourse))
	}
}

export const updateCourseFn = (id, updates) => {
	return async (dispatch) => {
		const updated = await updateCourse(id, updates)
		dispatch(updateCourseAction(updated))
	}
}

export default coursesSlice.reducer
