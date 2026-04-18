import { createSlice } from '@reduxjs/toolkit'
import { isTokenExpired, getToken } from '../services/authen/login'
import { rmUserFn } from './userReducer'
import { setError } from './notiReducer'
import { getThreads, createThread, createMessage } from '../services/discussion'

const initialState = {
	threads: [],
	activeThreadId: null,
	isLoading: false,
	isSending: false,
	error: null,
}

const discussionSlice = createSlice({
	name: 'discussion',
	initialState,
	reducers: {
		setThreads(state, action) {
			state.threads = action.payload
		},
		setActiveThread(state, action) {
			state.activeThreadId = action.payload
		},
		setLoading(state, action) {
			state.isLoading = action.payload
		},
		setSending(state, action) {
			state.isSending = action.payload
		},
		setDiscussionError(state, action) {
			state.error = action.payload
		},
		clearDiscussionError(state) {
			state.error = null
		},
	},
})

export const {
	setThreads,
	setActiveThread,
	setLoading,
	setSending,
	setDiscussionError,
	clearDiscussionError,
} = discussionSlice.actions

// ── Thunks ──────────────────────────────────────────

export const fetchThreadsFn = (courseId) => {
	return async (dispatch, getState) => {
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}

		dispatch(setLoading(true))
		dispatch(clearDiscussionError())

		try {
			const data = await getThreads(courseId)
			const sorted = [...data].sort(
				(a, b) => new Date(a.created_at) - new Date(b.created_at)
			)
			dispatch(setThreads(sorted))

			const { activeThreadId } = getState().discussion
			if (activeThreadId) {
				const stillExists = sorted.some((t) => t.thread_id === activeThreadId)
				if (!stillExists) {
					dispatch(setActiveThread(sorted[0]?.thread_id || null))
				}
			}
		} catch (error) {
			const message =
				error?.response?.data?.error || 'Unable to load discussion threads'
			dispatch(setDiscussionError(message))
		} finally {
			dispatch(setLoading(false))
		}
	}
}

export const createThreadFn = (courseId, title) => {
	return async (dispatch) => {
		const created = await createThread(courseId, title)

		const updatedData = await getThreads(courseId)
		const sorted = [...updatedData].sort(
			(a, b) => new Date(a.created_at) - new Date(b.created_at)
		)
		dispatch(setThreads(sorted))

		const newActive = sorted.find(t => t.thread_id === created.thread_id)
		dispatch(setActiveThread(newActive?.thread_id || created.thread_id))
	}
}

export const sendMessageFn = (courseId, threadId, messageContent) => {
	return async (dispatch) => {
		dispatch(setSending(true))

		try {
			await createMessage(threadId, messageContent)
			// Re-fetch threads to get the real message from the server
			const data = await getThreads(courseId)
			const sorted = [...data].sort(
				(a, b) => new Date(a.created_at) - new Date(b.created_at)
			)
			dispatch(setThreads(sorted))
		} catch (error) {
			dispatch(setError('Failed to send message. Please try again.', 5))
			throw error
		} finally {
			dispatch(setSending(false))
		}
	}
}

export default discussionSlice.reducer
