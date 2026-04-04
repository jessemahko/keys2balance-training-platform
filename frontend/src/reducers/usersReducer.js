import { createSlice } from '@reduxjs/toolkit'
import { getAllUsers, updateUserRole } from '../services/users'

const initialState = []

const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		setUsers(state, action) {
			return action.payload
		},
		updateUser(state, action) {
			const updatedUser = action.payload
			return state.map((u) => (u.user_id === updatedUser.user_id ? updatedUser : u))
		},
	},
})

export const { setUsers, updateUser } = usersSlice.actions

export const setUsersFn = () => {
	return async (dispatch) => {
		try {
			const users = await getAllUsers()
			dispatch(setUsers(users))
		} catch (error) {
			console.error('Failed to load users:', error)
		}
	}
}

export const toggleUserRoleFn = (userId, newRole) => {
	return async (dispatch) => {
		try {
			const updatedUser = await updateUserRole(userId, newRole)
			dispatch(updateUser(updatedUser))
		} catch (error) {
			console.error('Failed to change user role:', error)
			throw error
		}
	}
}

export default usersSlice.reducer
