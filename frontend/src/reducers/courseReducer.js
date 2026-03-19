import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { rmUserFn } from './userReducer'
import { getAllCourses } from '../services/courses'

const initialState = []

const coursesSlice = createSlice({
	name: 'courses',
	initialState: initialState,
	reducers: {
		setCourses(state, action) {
			return action.payload
		},
	},
})

export const { setCourses } = coursesSlice.actions

export const setCoursesFn = (courses) => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}

		const courses = await getAllCourses()
		console.log(courses, typeof courses)

		// console.log('1', typeof courses)

		dispatch(setCourses(courses))
	}
}
