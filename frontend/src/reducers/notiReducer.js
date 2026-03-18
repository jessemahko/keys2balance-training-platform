import { createSlice } from '@reduxjs/toolkit'

let notiTimeout, errorTimeout // Global variable to store the timeout ID

const initialState = {
	noti: '',
	error: '',
}

const notiSlice = createSlice({
	name: 'noti',
	initialState,
	reducers: {
		setNoti(state, action) {
			return { ...state, noti: action.payload }
		},
		removeNoti(state) {
			return { ...state, noti: '' }
		},
		setErrorMessage(state, action) {
			return { ...state, error: action.payload }
		},
		removeError(state) {
			return { ...state, error: '' }
		},
	},
})

export const { setNoti, removeNoti, setErrorMessage, removeError } =
	notiSlice.actions

// Unified setNotification function with timeout clearing
export const setNotification = (notification, seconds) => {
	return async (dispatch) => {
		// Clear any existing timeout
		if (notiTimeout) {
			clearTimeout(notiTimeout)
		}

		// Dispatch the new notification
		dispatch(setNoti(notification))

		// Set a new timeout
		notiTimeout = setTimeout(() => {
			dispatch(removeNoti())
		}, seconds * 1000)
	}
}

export const clearMessages = () => {
	return async (dispatch) => {
		// Clear any existing timeouts
		if (notiTimeout) {
			clearTimeout(notiTimeout)
		}
		if (errorTimeout) {
			clearTimeout(errorTimeout)
		}

		// Dispatch actions to clear notifications and errors
		dispatch(removeNoti())
		dispatch(removeError())
	}
}

// Unified setError function with timeout clearing
export const setError = (notification, seconds) => {
	return async (dispatch) => {
		// Clear any existing timeout
		if (errorTimeout) {
			clearTimeout(errorTimeout)
		}

		// Dispatch the new error message
		dispatch(setErrorMessage(notification))

		// Set a new timeout
		errorTimeout = setTimeout(() => {
			dispatch(removeError())
		}, seconds * 1000)
	}
}

export default notiSlice.reducer

