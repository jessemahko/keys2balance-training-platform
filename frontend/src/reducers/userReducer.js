import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { setError, setNotification } from './notiReducer'
import profile from '../services/profile'

const userSlice = createSlice({
	name: 'user',
	initialState: null,
	reducers: {
		setUser(state, action) {
			return action.payload
		},
		removeUser(state, action) {
			return null
		},
		editUser(state, action) {
			// console.log(state.token, action.payload.token)

			return { ...state, ...action.payload }
		},
	},
})

export const { setUser, removeUser, editUser } = userSlice.actions

// Thunks
export const setUserFn = (user) => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}
		try {
			const userData = await profile.getMe(user.id)
			window.localStorage.setItem(
				'loggedUser',
				JSON.stringify({ ...user, ...userData }),
			)
			dispatch(setUser({ ...user, ...userData }))
		} catch (err) {
			dispatch(setError('Failed to fetch user data', 5))
			dispatch(rmUserFn())
			return
		}
	}
}

export const rmUserFn = () => {
	return (dispatch) => {
		window.localStorage.removeItem('loggedUser')
		dispatch(removeUser())
	}
}

export const updateAvatar = (pic) => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}
		try {
			const { avatar_url } = await profile.updateAvatar(pic) // Extract the avatar_url
			const storedUser = window.localStorage.getItem('loggedUser')
			const parsedUser = storedUser ? JSON.parse(storedUser) : null
			window.localStorage.setItem(
				'loggedUser',
				JSON.stringify({ ...(parsedUser || {}), avatar_url }),
			)
			dispatch(editUser({ avatar_url })) // Pass it as a string
		} catch (err) {
			dispatch(
				setError(
					err.response?.data?.error || err.message || 'Failed to update avatar',
					5,
				),
			)
		}
	}
}

export const updateProfile = (user) => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}
		try {
			await profile.updateProfile(user)
			const storedUser = window.localStorage.getItem('loggedUser')
			const parsedUser = storedUser ? JSON.parse(storedUser) : null
			window.localStorage.setItem(
				'loggedUser',
				JSON.stringify({
					...(parsedUser || {}),
					...user,
					is_verified: user.email === parsedUser.email,
				}),
			)
			if (user.email) {
				dispatch(
					setNotification(
						'Email updated. Please verify your new email address.',
						5,
					),
				)
			}
			dispatch(
				editUser({ ...user, is_verified: user.email === parsedUser.email }),
			)
		} catch (err) {
			throw err
		}
	}
}

export default userSlice.reducer
