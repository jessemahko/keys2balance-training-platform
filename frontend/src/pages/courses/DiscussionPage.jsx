import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getThreads, createMessage } from '../../services/discussion'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import './discussion.css'

const DiscussionPage = () => {
	const { courseId } = useParams()
	const user = useSelector((state) => state.user)
	const [threads, setThreads] = useState([])
	const [activeThread, setActiveThread] = useState(null)
	const [newMessage, setNewMessage] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isSending, setIsSending] = useState(false)
	const chatEndRef = useRef(null)

	const scrollToBottom = () => {
		chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		const fetchThreads = async () => {
			try {
				const data = await getThreads(courseId)
				setThreads(data)
				if (data.length > 0) {
					setActiveThread(data[0])
				}
			} catch (error) {
				console.error('Error fetching threads:', error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchThreads()
	}, [courseId])

	useEffect(() => {
		scrollToBottom()
	}, [activeThread?.messages])

	const handleSendMessage = async (e) => {
		e.preventDefault()
		if (!newMessage.trim() || !activeThread || isSending) return

		setIsSending(true)
		try {
			const sentMessage = await createMessage(activeThread.thread_id, newMessage)
			
			// Update local state to show message immediately
			const messageWithUser = {
				...sentMessage,
				user: {
					user_id: user.id,
					first_name: user.first_name || user.name?.split(' ')[0] || 'Me',
					last_name: user.last_name || '',
					avatar_url: user.avatar_url
				}
			}

			const updatedThreads = threads.map(t => {
				if (t.thread_id === activeThread.thread_id) {
					return {
						...t,
						messages: [...(t.messages || []), messageWithUser]
					}
				}
				return t
			})

			setThreads(updatedThreads)
			setActiveThread(updatedThreads.find(t => t.thread_id === activeThread.thread_id))
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

	if (threads.length === 0) {
		return (
			<div className='discussion-empty'>
				<Groups2RoundedIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
				<h2>No discussions yet</h2>
				<p>This course doesn't have any discussion threads initialized.</p>
				<Link to='/dashboard' className='dashboard-primary-action'>Back to Dashboard</Link>
			</div>
		)
	}

	const messages = activeThread?.messages || []

	return (
		<div className='discussion-container'>
			<header className='discussion-header'>
				<div className='discussion-header-content'>
					<Link to={`/dashboard/courses/${courseId}`} className='discussion-back-link'>
						&larr; Back to Course
					</Link>
					<h1>{activeThread?.title || 'Course Discussion'}</h1>
				</div>
			</header>

			<div className='discussion-chat-window'>
				<div className='discussion-messages-list'>
					{messages.length === 0 ? (
						<div className='discussion-no-messages'>
							<p>No messages yet. Start the conversation!</p>
						</div>
					) : (
						messages.map((msg) => {
							const isOwn = String(msg.user_id) === String(user.id)
							const displayName = msg.user ? `${msg.user.first_name} ${msg.user.last_name}`.trim() : 'Unknown User'
							
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
						placeholder='Type your reflection or question...'
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
			</div>
		</div>
	)
}

export default DiscussionPage
