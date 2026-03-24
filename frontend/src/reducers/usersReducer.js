import { createSlice } from '@reduxjs/toolkit'
import { getAllUsers } from '../services/users'

const initialState = []

const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		setUsers(state, action) {
			return action.payload
		},
	},
})

export const { setUsers } = usersSlice.actions

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

export default usersSlice.reducer
