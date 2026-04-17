import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setError } from '../../reducers/notiReducer'
import {
	fetchThreadsFn,
	createThreadFn,
	sendMessageFn,
	setActiveThread,
} from '../../reducers/discussionReducer'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CircularProgress from '@mui/material/CircularProgress'
import profilePicNull from '../../assets/profile-picture-null.png'
import { API_BASE_URL } from '../../services/apiConfig'
import { useTranslation } from 'react-i18next'

const DiscussionPage = () => {
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const location = useLocation()
	const navigate = useNavigate()
	const { courseId } = useParams()
	const user = useSelector((state) => state.user)

	// Redux state
	const threads = useSelector((state) => state.discussion.threads)
	const activeThreadId = useSelector((state) => state.discussion.activeThreadId)
	const isLoading = useSelector((state) => state.discussion.isLoading)
	const isSending = useSelector((state) => state.discussion.isSending)

	// Derived: the full active thread object
	const activeThread =
		threads.find((t) => t.thread_id === activeThreadId) || null

	// Helper to get the consistent current user ID
	const currentUserId = user?.user_id || user?.id || user?.sub

	// Local UI state (form inputs only)
	const [newThreadTitle, setNewThreadTitle] = useState('')
	const [isCreatingThread, setIsCreatingThread] = useState(false)
	const [newMessage, setNewMessage] = useState('')
	const chatEndRef = useRef(null)

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		dispatch(fetchThreadsFn(courseId))
	}, [courseId, dispatch])

	useEffect(() => {
		scrollToBottom()
	}, [activeThread?.messages])

	const handleCreateThread = async (e) => {
		e.preventDefault()
		if (!newThreadTitle.trim() || isCreatingThread) return

		setIsCreatingThread(true)
		try {
			await dispatch(createThreadFn(courseId, newThreadTitle))
			setNewThreadTitle('')
		} catch (error) {
			console.error('Error creating thread:', error)
			dispatch(setError('Failed to create thread. Please try again.', 5))
		} finally {
			setIsCreatingThread(false)
		}
	}

	const handleSendMessage = async (e) => {
		e.preventDefault()
		if (!newMessage.trim() || !activeThread || isSending) return

		try {
			await dispatch(
				sendMessageFn(courseId, activeThread.thread_id, newMessage.trim()),
			)
			setNewMessage('') // Clear only after backend confirms
		} catch (error) {
			console.error('Error sending message:', error)
		}
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-full text-[#64748b]'>
				{t('Loading discussion...')}
			</div>
		)
	}

	return (
		<div className='flex h-full w-full bg-[#f8fafc] overflow-hidden'>
			<aside
				className={`${activeThreadId ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] shrink-0 bg-white border-r border-[#e2e8f0] flex-col z-20`}
			>
				<header className='p-6 border-b border-[#f1f5f9]'>
					<h3 className='text-[1.25rem] font-bold text-[#0f172a] m-0 text-center'>
						{t('Threads')}
					</h3>
				</header>

				<div className='flex-1 overflow-y-auto p-2'>
					{threads.map((thread) => (
						<button
							key={thread.thread_id}
							className={`w-full text-left p-4 bg-transparent border-none rounded-[0.75rem] cursor-pointer transition-all duration-200 mb-1 hover:bg-[#f1f5f9] ${activeThread?.thread_id === thread.thread_id ? 'bg-[#eef2ff]! border-l-4! border-l-[#14b8a6]!' : ''}`}
							onClick={() => dispatch(setActiveThread(thread.thread_id))}
						>
							<div className='flex flex-col gap-1'>
								<span className='font-semibold text-[#1e293b] text-[0.9375rem]'>
									{thread.title}
								</span>
								<span className='text-xs text-[#64748b]'>
									{thread.messages?.length || 0} {t('messages')}
								</span>
							</div>
						</button>
					))}
				</div>

				<form
					className='p-4 border-t border-[#f1f5f9] flex gap-2'
					onSubmit={handleCreateThread}
				>
					<input
						type='text'
						className='flex-1 p-[0.5rem_0.75rem] rounded-[0.5rem] border border-[#e2e8f0] text-[0.875rem] outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]'
						placeholder={t('New thread title...')}
						value={newThreadTitle}
						onChange={(e) => setNewThreadTitle(e.target.value)}
					/>
					<button
						type='submit'
						disabled={!newThreadTitle.trim() || isCreatingThread}
						className='bg-[#14b8a6] text-white rounded-[0.5rem] p-2 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity'
					>
						<AddBoxRoundedIcon />
					</button>
				</form>
			</aside>

			<div
				className={`${activeThreadId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#f8fafc] min-w-0`}
			>
				<header className='p-4 sm:p-6 pl-[3rem] sm:pl-[4.5rem] md:pl-6 bg-white border-b border-[#e2e8f0] flex items-center gap-3 sm:gap-4 min-w-0'>
					{activeThreadId && (
						<button
							className='md:hidden p-2 -ml-2 rounded-full cursor-pointer hover:bg-[#f1f5f9] flex items-center justify-center border-none bg-transparent'
							onClick={() => dispatch(setActiveThread(null))}
							title={t('Back to threads')}
						>
							<ArrowBackRoundedIcon sx={{ color: '#64748b' }} />
						</button>
					)}
					<h1 className='text-[1.25rem] font-bold text-[#0f172a] m-0 truncate'>
						{activeThread?.title || t('Select a thread')}
					</h1>
				</header>

				<div className='flex-1 flex flex-col overflow-hidden relative'>
					{activeThread ? (
						<>
							<div className='flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-5'>
								{(activeThread.messages || []).length === 0 ? (
									<div className='flex flex-col items-center justify-center h-full text-[#64748b]'>
										<p>{t('No messages yet. Start the conversation!')}</p>
									</div>
								) : (
									(activeThread.messages || []).map((msg) => {
										const isOwn = String(msg.user_id) === String(currentUserId)
										const displayName = msg.user
											? `${msg.user.first_name} ${msg.user.last_name}`.trim()
											: t('User')

										const resolvedProfileImageUrl = msg.user?.avatar_url
											? msg.user.avatar_url.startsWith('http://') ||
												msg.user.avatar_url.startsWith('https://')
												? msg.user.avatar_url
												: `${API_BASE_URL}${msg.user.avatar_url}`
											: profilePicNull

										return (
											<div
												key={msg.message_id}
												className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${isOwn ? 'self-end flex-row-reverse' : ''}`}
											>
												{!isOwn && (
													<div
														className='w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer hover:opacity-60'
														onClick={() => {
															navigate(`/profile/${msg.user_id}`, {
																state: { from: location.pathname },
															})
														}}
													>
														<img
															src={resolvedProfileImageUrl}
															alt={displayName}
															className='w-full h-full object-cover'
														/>
													</div>
												)}
												<div className='flex flex-col'>
													{!isOwn && (
														<span className='text-xs font-semibold text-[#64748b] mb-1 block'>
															{displayName}
														</span>
													)}
													<div
														className={`p-[0.75rem_1rem] rounded-[1rem] shadow-sm border ${isOwn ? 'bg-[#7c3aed] text-white border-[#7c3aed] rounded-tr-[0.25rem]' : 'bg-white border-[#e2e8f0] rounded-tl-[0.25rem]'}`}
													>
														<p className='m-0 text-[0.9375rem] leading-relaxed'>
															{msg.message_text}
														</p>
														<span
															className={`text-[0.625rem] mt-1 block text-right ${isOwn ? 'text-white/80' : 'text-[#94a3b8]'}`}
														>
															{new Date(msg.created_at).toLocaleString([], {
																year: 'numeric',
																month: '2-digit',
																day: '2-digit',
																hour: '2-digit',
																minute: '2-digit',
															})}
														</span>
													</div>
												</div>
											</div>
										)
									})
								)}
								<div ref={chatEndRef} />
							</div>

							<form
								className='p-3 sm:p-[1.5rem_2rem] bg-white border-t border-[#e2e8f0] flex gap-3 sm:gap-4'
								onSubmit={handleSendMessage}
							>
								<textarea
									className='flex-1 bg-[#f1f5f9] border border-[#e2e8f0] rounded-[0.75rem] p-[0.75rem_1rem] resize-none h-[44px] outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]'
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									placeholder={t('Type your message...')}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault()
											handleSendMessage(e)
										}
									}}
								/>
								<button
									type='submit'
									disabled={!newMessage.trim() || isSending}
									className='bg-[#14b8a6] text-white w-11 h-11 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity'
								>
									{isSending ? (
										<CircularProgress size={20} sx={{ color: 'white' }} />
									) : (
										<SendRoundedIcon />
									)}
								</button>
							</form>
						</>
					) : (
						<div className='flex flex-col items-center justify-center h-full text-[#64748b]'>
							<Groups2RoundedIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
							<h2 className='text-2xl font-bold mt-4'>
								{t('Start a Discussion')}
							</h2>
							<p>
								{t('Select an existing thread or create a new one to begin.')}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default DiscussionPage
