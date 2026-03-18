import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/login'
// import profile from '../services/profile'

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

// export const updateProfile = (user) => {
// 	return async (dispatch) => {
// 		if (isTokenExpired(getToken())) {
// 			dispatch(rmUserFn())
// 			return
// 		}
// 		await profile.updateProfile(user)
// 		dispatch(editUser(user))
// 	}
// }

export default userSlice.reducer

