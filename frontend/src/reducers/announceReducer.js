import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { rmUserFn } from './userReducer'
import AnnouncementService from '../services/announcement/announcement'

const initialState = []

const announceSlice = createSlice({
	name: 'notifications',
	initialState: initialState,
	reducers: {
		setAnnouncement(state, action) {
			return action.payload
		},
		markAsReadNotification(state, action) {
			const id = action.payload
			return state.map((noti) =>
				noti.notification_id === id ? { ...noti, is_read: true } : noti,
			)
		},
		deleteAnnouncement(state, action) {
			const id = action.payload
			return state.filter((noti) => noti.notification_id !== id)
		},
	},
})

export const { setAnnouncement, markAsReadNotification, deleteAnnouncement } =
	announceSlice.actions

export const setNotificationsFn = () => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}

		const notifications = await AnnouncementService.getAllNotifications()

		dispatch(setAnnouncement(notifications))
	}
}

export const markAsReadFn = (id) => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}
		await AnnouncementService.markAsRead(id)
		dispatch(markAsReadNotification(id))
	}
}

export const deleteNotificationFn = (id) => {
	return async (dispatch) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}
		await AnnouncementService.deleteNotification(id)
		dispatch(deleteAnnouncement(id))
	}
}
export default announceSlice.reducer
