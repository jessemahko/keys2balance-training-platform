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
		addOptimisticMessage(state, action) {
			const { threadId, message } = action.payload
			const thread = state.threads.find(t => t.thread_id === threadId)
			if (thread) {
				if (!thread.messages) thread.messages = []
				thread.messages.push(message)
			}
		},
		removeOptimisticMessage(state, action) {
			const { threadId, messageId } = action.payload
			const thread = state.threads.find(t => t.thread_id === threadId)
			if (thread && thread.messages) {
				thread.messages = thread.messages.filter(m => m.message_id !== messageId)
			}
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
	addOptimisticMessage,
	removeOptimisticMessage,
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
			if (sorted.length > 0 && !activeThreadId) {
				dispatch(setActiveThread(sorted[0].thread_id))
			} else if (activeThreadId) {
				// Keep current selection only if it still exists
				const stillExists = sorted.some(t => t.thread_id === activeThreadId)
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

		// Re-fetch all threads so the list is up-to-date
		const updatedData = await getThreads(courseId)
		const sorted = [...updatedData].sort(
			(a, b) => new Date(a.created_at) - new Date(b.created_at)
		)
		dispatch(setThreads(sorted))

		// Activate the newly created thread
		const newActive = sorted.find(t => t.thread_id === created.thread_id)
		dispatch(setActiveThread(newActive?.thread_id || created.thread_id))
	}
}

export const sendMessageFn = (courseId, threadId, messageContent, user) => {
	return async (dispatch) => {
		const currentUserId = user?.user_id || user?.id || user?.sub

		dispatch(setSending(true))

		// Optimistic update
		const tempId = Date.now()
		const optimisticMessage = {
			message_id: tempId,
			user_id: currentUserId,
			message_text: messageContent,
			created_at: new Date().toISOString(),
			user: {
				user_id: currentUserId,
				first_name: user?.first_name || 'Me',
				last_name: user?.last_name || '',
				avatar_url: user?.avatar_url,
			},
		}

		dispatch(addOptimisticMessage({ threadId, message: optimisticMessage }))

		try {
			await createMessage(threadId, messageContent)
			// Re-fetch threads to sync with server (real IDs & timestamps)
			const data = await getThreads(courseId)
			const sorted = [...data].sort(
				(a, b) => new Date(a.created_at) - new Date(b.created_at)
			)
			dispatch(setThreads(sorted))
		} catch (error) {
			// Rollback the optimistic message
			dispatch(removeOptimisticMessage({ threadId, messageId: tempId }))
			dispatch(setError('Failed to send message. Please try again.', 5))
			// Re-throw so the component can restore the input text
			throw error
		} finally {
			dispatch(setSending(false))
		}
	}
}

export default discussionSlice.reducer
