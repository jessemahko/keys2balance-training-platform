import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { rmUserFn } from './userReducer'
import { getAllCourses, getCourseById, createCourse, updateCourse, enrollParticipant, removeParticipant } from '../services/courses'

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
			state.items = action.payload
		},
		appendCourse(state, action) {
			state.items.push(action.payload)
		},
		updateCourseAction(state, action) {
			const index = state.items.findIndex((c) => String(c.course_id) === String(action.payload.course_id))
			if (index !== -1) {
				state.items[index] = action.payload
			}
		},
		addParticipantAction(state, action) {
			const { courseId, user } = action.payload
			const course = state.items.find((c) => String(c.course_id) === String(courseId))
			if (course) {
				if (!Array.isArray(course.participants)) {
					course.participants = []
				}
				course.participants.push(user)
			}
		},
		removeParticipantAction(state, action) {
			const { courseId, userId } = action.payload
			const course = state.items.find((c) => String(c.course_id) === String(courseId))
			if (course && Array.isArray(course.participants)) {
				course.participants = course.participants.filter((p) => String(p.user_id) !== String(userId))
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

export const { setCourses, appendCourse, updateCourseAction, addParticipantAction, removeParticipantAction, setLoading, setLoadError, clearError } = coursesSlice.actions

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

export const toggleEnrollmentFn = (courseId, user, isCurrentlyEnrolled) => {
	return async (dispatch) => {
		if (isCurrentlyEnrolled) {
			await removeParticipant(courseId, user.user_id)
			dispatch(removeParticipantAction({ courseId, userId: user.user_id }))
		} else {
			await enrollParticipant(courseId, user.user_id)
			dispatch(addParticipantAction({ courseId, user }))
		}
	}
}

export default coursesSlice.reducer
