import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getThreads, createThread, createMessage } from '../../services/discussion'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'
import './discussion.css'

const DiscussionPage = () => {
	const { courseId } = useParams()
	const user = useSelector((state) => state.user)
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
			// Sort threads by creation date (oldest first) or newest first?
			// The user said "chronologically ordered" - usually newest last or first.
			// Let's go with the data as is (backend might sort newest first), 
			// but we'll sort explicitly if needed.
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
			
			// Refresh list from server to ensure all state is synced
			const updatedData = await getThreads(courseId)
			const sorted = [...updatedData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
			setThreads(sorted)
			
			// Find and set the newly created thread as active
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

		setIsSending(true)
		try {
			const sentMessage = await createMessage(activeThread.thread_id, newMessage)
			
			// Refresh to get full user details for the new message
			await fetchThreads()
			setNewMessage('')
		} catch (error) {
			console.error('Error sending message:', error)
		} finally {
			setIsSending(false)
		}
	}

	if (isLoading) {
		return <div className='discussion-loading'>Loading discussion...</div>
	}

	return (
		<div className='discussion-container'>
			<aside className='discussion-sidebar'>
				<header className='sidebar-header'>
					<Link to={`/dashboard/courses/${courseId}`} className='discussion-back-link'>
						&larr; Course
					</Link>
					<h3>Threads</h3>
				</header>
				
				<div className='threads-list'>
					{threads.map(thread => (
						<button 
							key={thread.thread_id}
							className={`thread-item ${activeThread?.thread_id === thread.thread_id ? 'active' : ''}`}
							onClick={() => setActiveThread(thread)}
						>
							<div className='thread-item-info'>
								<span className='thread-title'>{thread.title}</span>
								<span className='thread-meta'>{thread.messages?.length || 0} messages</span>
							</div>
						</button>
					))}
				</div>

				<form className='create-thread-form' onSubmit={handleCreateThread}>
					<input 
						type='text' 
						placeholder='New thread title...'
						value={newThreadTitle}
						onChange={(e) => setNewThreadTitle(e.target.value)}
					/>
					<button type='submit' disabled={!newThreadTitle.trim() || isCreatingThread}>
						<AddBoxRoundedIcon />
					</button>
				</form>
			</aside>

			<div className='discussion-main'>
				<header className='discussion-header'>
					<h1>{activeThread?.title || 'Select a thread'}</h1>
				</header>

				<div className='discussion-chat-window'>
					{activeThread ? (
						<>
							<div className='discussion-messages-list'>
								{(activeThread.messages || []).length === 0 ? (
									<div className='discussion-no-messages'>
										<p>No messages yet. Start the conversation!</p>
									</div>
								) : (
									(activeThread.messages || []).map((msg) => {
										const isOwn = String(msg.user_id) === String(user.id)
										const displayName = msg.user ? `${msg.user.first_name} ${msg.user.last_name}`.trim() : 'User'
										
										return (
											<div 
												key={msg.message_id} 
												className={`discussion-message-row ${isOwn ? 'own' : ''}`}
											>
												{!isOwn && (
													<div className='discussion-avatar'>
														{msg.user?.avatar_url ? (
															<img src={msg.user.avatar_url} alt={displayName} />
														) : (
															<div className='avatar-placeholder'>
																{displayName.charAt(0)}
															</div>
														)}
													</div>
												)}
												<div className='discussion-message-content'>
													{!isOwn && <span className='discussion-sender-name'>{displayName}</span>}
													<div className='discussion-bubble'>
														<p>{msg.message_text}</p>
														<span className='discussion-timestamp'>
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

							<form className='discussion-input-area' onSubmit={handleSendMessage}>
								<textarea
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
									className='discussion-send-btn'
								>
									<SendRoundedIcon />
								</button>
							</form>
						</>
					) : (
						<div className='discussion-empty'>
							<Groups2RoundedIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
							<h2>Start a Discussion</h2>
							<p>Select an existing thread or create a new one to begin.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default DiscussionPage
