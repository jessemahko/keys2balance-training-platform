import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { setError } from './notiReducer'
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
			dispatch(setError('Failed to fetch user data', 2))
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
		const { avatar_url } = await profile.updateAvatar(pic) // Extract the avatar_url
		window.localStorage.setItem(
			'loggedUser',
			JSON.stringify((prev) => ({ ...prev, avatar_url })), // Update the stored user with the new avatar_url
		)
		dispatch(editUser({ avatar_url })) // Pass it as a string
	}
}

export const updateProfile = (user) => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}
		await profile.updateProfile(user)
		window.localStorage.setItem(
			'loggedUser',
			JSON.stringify((prev) => ({ ...prev, ...user })), // Update the stored user with the new profile data
		)

		dispatch(editUser(user))
	}
}

export default userSlice.reducer
