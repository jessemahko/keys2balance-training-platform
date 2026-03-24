import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { setUsersFn } from '../../reducers/usersReducer'
import { enrollParticipant, removeParticipant } from '../../services/courses'

const ParticipantModal = ({ isOpen, onClose, course, onParticipantsChanged }) => {
	const dispatch = useDispatch()
	const allUsers = useSelector((state) => state.users) || []
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [processingId, setProcessingId] = useState(null)

	useEffect(() => {
		if (isOpen) {
			const fetchUsers = async () => {
				setLoading(true)
				try {
					await dispatch(setUsersFn())
				} catch (err) {
					setError('Failed to load participants.')
				} finally {
					setLoading(false)
				}
			}
			if (allUsers.length === 0) {
				fetchUsers()
			} else {
				// Refresh quietly
				dispatch(setUsersFn()).catch(() => setError('Failed to refresh participants.'))
			}
		}
	}, [isOpen, dispatch, allUsers.length])

	if (!isOpen) return null

	const enrolledUserIds = new Set(
		(course.participants || []).map((p) => p.user_id),
	)

	const handleToggleEnrollment = async (user) => {
		setProcessingId(user.user_id)
		try {
			if (enrolledUserIds.has(user.user_id)) {
				await removeParticipant(course.course_id, user.user_id)
			} else {
				await enrollParticipant(course.course_id, user.user_id)
			}
			if (onParticipantsChanged) {
				await onParticipantsChanged()
			}
		} catch (err) {
			console.error('Failed to toggle enrollment', err)
		} finally {
			setProcessingId(null)
		}
	}

	return (
		<div className="modal-overlay" style={{
			position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
			backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
			justifyContent: 'center', alignItems: 'center', zIndex: 1000
		}}>
			<div className="modal-content" style={{
				backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
				width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto'
			}}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
					<h2 style={{ margin: 0 }}>Manage Participants</h2>
					<button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.5rem', color: '#000' }}>&times;</button>
				</div>
				
				{error && <p style={{ color: 'red' }}>{error}</p>}
				{loading ? <p>Loading participants...</p> : (
					<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
						{allUsers.length === 0 ? <p>No participants found.</p> : null}
						{allUsers.map(user => {
							const isEnrolled = enrolledUserIds.has(user.user_id)
							const isProcessing = processingId === user.user_id
							return (
								<li key={user.user_id} style={{
									display: 'flex', justifyContent: 'space-between', alignItems: 'center',
									padding: '0.75rem 0', borderBottom: '1px solid #eee'
								}}>
									<div>
										<strong style={{ display: 'block', color: '#000' }}>{user.first_name || user.username} {user.last_name || ''}</strong>
										<span style={{ fontSize: '0.85rem', color: '#666' }}>{user.email}</span>
									</div>
									<button 
										onClick={() => handleToggleEnrollment(user)}
										disabled={isProcessing}
										style={{
											padding: '0.5rem 1rem',
											borderRadius: '4px',
											cursor: isProcessing ? 'not-allowed' : 'pointer',
											fontWeight: 'bold',
											border: 'none',
											backgroundColor: isEnrolled ? '#fee2e2' : '#e0e7ff',
											color: isEnrolled ? '#991b1b' : '#3730a3'
										}}
									>
										{isProcessing ? 'Processing...' : isEnrolled ? 'Remove' : 'Enroll'}
									</button>
								</li>
							)
						})}
					</ul>
				)}
			</div>
		</div>
	)
}

ParticipantModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	course: PropTypes.object.isRequired,
	onParticipantsChanged: PropTypes.func,
}

export default ParticipantModal
