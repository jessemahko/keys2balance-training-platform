import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
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
	return (dispatch) => {
		dispatch(setUser(user))
	}
}

export const rmUserFn = () => {
	return (dispatch) => dispatch(removeUser())
}

// export const updateAvatar = (pic) => {
// 	return async (dispatch) => {
// 		if (isTokenExpired(getToken())) {
// 			dispatch(rmUserFn())
// 			return
// 		}
// 		const { avatarUrl } = await profile.updateAvatar(pic) // Extract the avatarUrl

// 		dispatch(editUser({ avatarUrl })) // Pass it as a string
// 	}
// }

export const updateMyProfile = (user) => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}
		const updatedProfile = await profile.updateMyProfile(user)
		dispatch(editUser(user))
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
				if (loggedUserJSON) {
					const loggedUser = JSON.parse(loggedUserJSON)
					const newLoggedUser = { ...loggedUser, ...updatedProfile }
					window.localStorage.setItem('loggedUser', JSON.stringify(newLoggedUser))
				}
	}
}



export default userSlice.reducer
