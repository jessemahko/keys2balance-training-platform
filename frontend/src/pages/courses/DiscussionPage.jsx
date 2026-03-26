import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getThreads, createThread, createMessage } from '../../services/discussion'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'

const DiscussionPage = () => {
	const { courseId } = useParams()
	const user = useSelector((state) => state.user)
	
	// Helper to get the consistent current user ID
	const currentUserId = user?.user_id || user?.id || user?.sub

	const [threads, setThreads] = useState([])
	const [activeThread, setActiveThread] = useState(null)
	const [newThreadTitle, setNewThreadTitle] = useState('')
	const [isCreatingThread, setIsCreatingThread] = useState(false)
	const [newMessage, setNewMessage] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSending, setIsSending] = useState(false)
	const chatEndRef = useRef(null)

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	const fetchThreads = async () => {
		try {
			const data = await getThreads(courseId)
			const sorted = [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
			setThreads(sorted)
			if (sorted.length > 0 && !activeThread) {
				setActiveThread(sorted[0])
			} else if (activeThread) {
				const updatedActive = sorted.find(t => t.thread_id === activeThread.thread_id)
				if (updatedActive) setActiveThread(updatedActive)
			}
		} catch (error) {
			console.error('Error fetching threads:', error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchThreads()
	}, [courseId])

	useEffect(() => {
		scrollToBottom()
	}, [activeThread?.messages])

	const handleCreateThread = async (e) => {
		e.preventDefault()
		if (!newThreadTitle.trim() || isCreatingThread) return

		setIsCreatingThread(true)
		try {
			const created = await createThread(courseId, newThreadTitle)
			setNewThreadTitle('')
			
			const updatedData = await getThreads(courseId)
			const sorted = [...updatedData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
			setThreads(sorted)
			
			const newActive = sorted.find(t => t.thread_id === created.thread_id)
			setActiveThread(newActive || created)
		} catch (error) {
			console.error('Error creating thread:', error)
			alert('Failed to create thread. Please try again.')
		} finally {
			setIsCreatingThread(false)
		}
	}

	const handleSendMessage = async (e) => {
		e.preventDefault()
		if (!newMessage.trim() || !activeThread || isSending) return

		const messageContent = newMessage.trim()
		setNewMessage('')
		setIsSending(true)

		// Optimistic update: Add the message to the UI immediately
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
				avatar_url: user?.avatar_url
			}
		}

		// Pre-update the active thread locally
		const updatedActiveThread = {
			...activeThread,
			messages: [...(activeThread.messages || []), optimisticMessage]
		}
		setActiveThread(updatedActiveThread)

		try {
			await createMessage(activeThread.thread_id, messageContent)
			// Re-fetch to sync with server (get real ID and timestamp)
			await fetchThreads()
		} catch (error) {
			console.error('Error sending message:', error)
			// Rollback on error: remove the optimistic message
			const rolledBackThread = {
				...activeThread,
				messages: activeThread.messages.filter(m => m.message_id !== tempId)
			}
			setActiveThread(rolledBackThread)
			setNewMessage(messageContent) // Restore the text for retry
			alert('Failed to send message. Please try again.')
		} finally {
			setIsSending(false)
		}
	}

	if (isLoading) {
		return <div className='flex items-center justify-center h-full text-[#64748b]'>Loading discussion...</div>
	}

	return (
		<div className='flex h-screen bg-[#f8fafc] overflow-hidden'>
			<aside className='w-[300px] bg-white border-r border-[#e2e8f0] flex flex-col z-20'>
				<header className='p-6 border-b border-[#f1f5f9]'>
					<Link to={`/dashboard/courses/${courseId}`} className='text-[#64748b] no-underline text-sm hover:underline'>
						&larr; Course
					</Link>
					<h3 className='mt-2 mb-0 text-xl font-bold text-[#0f172a]'>Threads</h3>
				</header>
				
				<div className='flex-1 overflow-y-auto p-2'>
					{threads.map(thread => (
						<button 
							key={thread.thread_id}
							className={`w-full text-left p-4 bg-transparent border-none rounded-[0.75rem] cursor-pointer transition-all duration-200 mb-1 hover:bg-[#f1f5f9] ${activeThread?.thread_id === thread.thread_id ? 'bg-[#eef2ff] border-l-4 border-l-[#14b8a6]' : ''}`}
							onClick={() => setActiveThread(thread)}
						>
							<div className='flex flex-col gap-1'>
								<span className='font-semibold text-[#1e293b] text-[0.9375rem]'>{thread.title}</span>
								<span className='text-xs text-[#64748b]'>{thread.messages?.length || 0} messages</span>
							</div>
						</button>
					))}
				</div>

				<form className='p-4 border-t border-[#f1f5f9] flex gap-2' onSubmit={handleCreateThread}>
					<input 
						type='text' 
						className='flex-1 p-[0.5rem_0.75rem] rounded-[0.5rem] border border-[#e2e8f0] text-[0.875rem] outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]'
						placeholder='New thread title...'
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

			<div className='flex-1 flex flex-col bg-[#f8fafc]'>
				<header className='p-[1.25rem_2rem] bg-white border-b border-[#e2e8f0]'>
					<h1 className='text-[1.25rem] font-bold text-[#0f172a] m-0'>{activeThread?.title || 'Select a thread'}</h1>
				</header>

				<div className='flex-1 flex flex-col overflow-hidden relative'>
					{activeThread ? (
						<>
							<div className='flex-1 overflow-y-auto p-8 flex flex-col gap-5'>
								{(activeThread.messages || []).length === 0 ? (
									<div className='flex flex-col items-center justify-center h-full text-[#64748b]'>
										<p>No messages yet. Start the conversation!</p>
									</div>
								) : (
									(activeThread.messages || []).map((msg) => {
										const isOwn = String(msg.user_id) === String(currentUserId)
										const displayName = msg.user ? `${msg.user.first_name} ${msg.user.last_name}`.trim() : 'User'
										
										return (
											<div 
												key={msg.message_id} 
												className={`flex gap-3 max-w-[80%] ${isOwn ? 'self-end flex-row-reverse' : ''}`}
											>
												{!isOwn && (
													<div className='w-9 h-9 rounded-full overflow-hidden shrink-0'>
														{msg.user?.avatar_url ? (
															<img src={msg.user.avatar_url} alt={displayName} className='w-full h-full object-cover' />
														) : (
															<div className='w-full h-full bg-[#e2e8f0] text-[#475569] flex items-center justify-center font-semibold text-sm'>
																{displayName.charAt(0)}
															</div>
														)}
													</div>
												)}
												<div className='flex flex-col'>
													{!isOwn && <span className='text-xs font-semibold text-[#64748b] mb-1 block'>{displayName}</span>}
													<div className={`p-[0.75rem_1rem] rounded-[1rem] shadow-sm border ${isOwn ? 'bg-[#7c3aed] text-white border-[#7c3aed] rounded-tr-[0.25rem]' : 'bg-white border-[#e2e8f0] rounded-tl-[0.25rem]'}`}>
														<p className='m-0 text-[0.9375rem] leading-relaxed'>{msg.message_text}</p>
														<span className={`text-[0.625rem] mt-1 block text-right ${isOwn ? 'text-white/80' : 'text-[#94a3b8]'}`}>
															{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
														</span>
													</div>
												</div>
											</div>
										)
									})
								)}
								<div ref={chatEndRef} />
							</div>

							<form className='p-[1.5rem_2rem] bg-white border-t border-[#e2e8f0] flex gap-4' onSubmit={handleSendMessage}>
								<textarea
									className='flex-1 bg-[#f1f5f9] border border-[#e2e8f0] rounded-[0.75rem] p-[0.75rem_1rem] resize-none h-[44px] outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]'
									value={newMessage}
									onChange={(e) => setNewMessage(e.target.value)}
									placeholder='Type your message...'
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
									<SendRoundedIcon />
								</button>
							</form>
						</>
					) : (
						<div className='flex flex-col items-center justify-center h-full text-[#64748b]'>
							<Groups2RoundedIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
							<h2 className='text-2xl font-bold mt-4'>Start a Discussion</h2>
							<p>Select an existing thread or create a new one to begin.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default DiscussionPage
