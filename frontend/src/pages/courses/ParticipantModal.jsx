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
		<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
			<div className="bg-white p-8 rounded-lg w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-4">
					<h2 className="m-0">Manage Participants</h2>
					<button onClick={onClose} className="cursor-pointer bg-transparent border-none text-2xl text-black">&times;</button>
				</div>
				
				{error && <p className="text-red-500">{error}</p>}
				{loading ? <p>Loading participants...</p> : (
					<ul className="list-none p-0 m-0">
						{allUsers.length === 0 ? <p>No participants found.</p> : null}
						{allUsers.map(user => {
							const isEnrolled = enrolledUserIds.has(user.user_id)
							const isProcessing = processingId === user.user_id
							return (
								<li key={user.user_id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
									<div>
										<strong className="block text-black">{user.first_name || user.username} {user.last_name || ''}</strong>
										<span className="text-[0.85rem] text-gray-500">{user.email}</span>
									</div>
									<button 
										onClick={() => handleToggleEnrollment(user)}
										disabled={isProcessing}
										className={`px-4 py-2 rounded font-bold border-none transition-colors ${
											isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
										} ${
											isEnrolled ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
										}`}
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
