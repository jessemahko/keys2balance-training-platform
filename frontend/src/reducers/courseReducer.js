import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { rmUserFn } from './userReducer'
import { getAllCourses, getCourseById, createCourse, updateCourse } from '../services/courses'

const initialState = {
	items: [],
	isLoading: false,
	error: null,
}

const coursesSlice = createSlice({
	name: 'courses',
	initialState,
	reducers: {
		setCourses(state, action) {
			// Merge list data with existing detailed data to avoid losing lessons/participants on refresh
			state.items = action.payload.map(incoming => {
				const existing = state.items.find(c => String(c.course_id) === String(incoming.course_id));
				if (existing) {
					return { 
						...existing, 
						...incoming,
						// Explicitly preserve arrays if incoming doesn't have them
						lessons: incoming.lessons || existing.lessons,
						participants: incoming.participants || existing.participants
					};
				}
				return incoming;
			});
		},
		appendCourse(state, action) {
			state.items.push(action.payload)
		},
		updateCourseAction(state, action) {
			const index = state.items.findIndex((c) => String(c.course_id) === String(action.payload.course_id))
			if (index !== -1) {
				state.items[index] = action.payload
			} else {
				state.items.push(action.payload)
			}
		},
		setLoading(state, action) {
			state.isLoading = action.payload
		},
		setLoadError(state, action) {
			state.error = action.payload
		},
		clearError(state) {
			state.error = null
		},
	},
})

export const { setCourses, appendCourse, updateCourseAction, setLoading, setLoadError, clearError } = coursesSlice.actions

export const setCoursesFn = () => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}

		dispatch(setLoading(true))
		dispatch(clearError())

		try {
			const courses = await getAllCourses()
			dispatch(setCourses(courses))
		} catch (error) {
			const message = error?.response?.data?.error || 'Unable to load your courses'
			dispatch(setLoadError(message))
		} finally {
			dispatch(setLoading(false))
		}
	}
}

export const createCourseFn = (courseData) => {
	return async (dispatch) => {
		const newCourse = await createCourse(courseData)
		dispatch(appendCourse(newCourse))
	}
}

export const fetchCourseByIdFn = (id) => {
	return async (dispatch) => {
		dispatch(setLoading(true))
		dispatch(clearError())

		try {
			const course = await getCourseById(id)
			dispatch(updateCourseAction(course))
		} catch (error) {
			const message = error?.response?.data?.error || 'Unable to load the course'
			dispatch(setLoadError(message))
		} finally {
			dispatch(setLoading(false))
		}
	}
}

export const updateCourseFn = (id, updates) => {
	return async (dispatch) => {
		const updated = await updateCourse(id, updates)
		dispatch(updateCourseAction(updated))
	}
}

export default coursesSlice.reducer
