import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { rmUserFn } from './userReducer'
import { getAllCourses, getCourseById, createCourse, updateCourse } from '../services/courses'

const initialState = []

const coursesSlice = createSlice({
	name: 'courses',
	initialState: initialState,
	reducers: {
		setCourses(state, action) {
			// Merge list data with existing detailed data to avoid losing lessons/participants on refresh
			return action.payload.map(incoming => {
				const existing = state.find(c => String(c.course_id) === String(incoming.course_id));
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
			state.push(action.payload)
		},
		updateCourseAction(state, action) {
			const index = state.findIndex((c) => String(c.course_id) === String(action.payload.course_id))
			if (index !== -1) {
				state[index] = action.payload
			} else {
				state.push(action.payload)
			}
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

export const fetchCourseByIdFn = (id) => {
	return async (dispatch) => {
		const course = await getCourseById(id)
		dispatch(updateCourseAction(course))
	}
}

export const updateCourseFn = (id, updates) => {
	return async (dispatch) => {
		const updated = await updateCourse(id, updates)
		dispatch(updateCourseAction(updated))
	}
}

export default coursesSlice.reducer
