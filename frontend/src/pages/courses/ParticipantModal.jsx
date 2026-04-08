import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { setUsersFn } from '../../reducers/usersReducer'
import { toggleEnrollmentFn } from '../../reducers/courseReducer'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch'

const ParticipantModal = ({ isOpen, onClose }) => {
	const { t } = useTranslation()
	const { courseId } = useParams()
	const dispatch = useDispatch()
	
	const course = useSelector((state) =>
		state.course.items.find((c) => String(c.course_id) === String(courseId))
	) || {}
	const allUsers = useSelector((state) => state.users) || []
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [processingId, setProcessingId] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const debouncedSearchTerm = useDebouncedSearch(searchTerm)

	const filteredUsers = allUsers.filter((user) => {
		const searchLower = debouncedSearchTerm.toLowerCase()
		const fullName = `${user.first_name || user.username} ${user.last_name || ''}`.toLowerCase()
		const email = (user.email || '').toLowerCase()
		return fullName.includes(searchLower) || email.includes(searchLower)
	})

	useEffect(() => {
		if (isOpen) {
			const fetchUsers = async () => {
				setLoading(true)
				try {
					dispatch(setUsersFn())
				} catch (err) {
					setError(t('Failed to load participants.'))
				} finally {
					setLoading(false)
				}
			}
			if (allUsers.length === 0) {
				fetchUsers()
			} else {
				// Refresh quietly
				dispatch(setUsersFn()).catch(() =>
					setError(t('Failed to refresh participants.')),
				)
			}
		}
	}, [isOpen, dispatch, allUsers.length, t])

	if (!isOpen) return null

	const enrolledUserIds = new Set(
		(course.participants || []).map((p) => p.user_id),
	)

	const handleToggleEnrollment = async (user) => {
		setProcessingId(user.user_id)
		try {
			const isEnrolled = enrolledUserIds.has(user.user_id)
			await dispatch(toggleEnrollmentFn(course.course_id, user, isEnrolled))
		} catch (err) {
			setError(t('Failed to update enrollment.'))
			console.error('Failed to toggle enrollment', err)
		} finally {
			setProcessingId(null)
		}
	}

	return (
		<div className='fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]'>
			<div className='bg-white p-8 rounded-lg w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='m-0'>{t('Manage Participants')}</h2>
					<button
						onClick={onClose}
						className='cursor-pointer bg-transparent border-none text-2xl text-black'
					>
						&times;
					</button>
				</div>

				{error && <p className='text-red-500'>{error}</p>}

				<div className='mb-4'>
					<label className='grid gap-[0.45rem]'>
						<span className='text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#7a7a7a]'>
							{t('Search participants')}
						</span>
						<input
							type='search'
							className='w-full p-[0.85rem_1rem] border border-[#4d458d]/[0.16] rounded-[14px] bg-[#f8f8fb] text-[#222] focus:outline-none focus:ring-2 focus:ring-[#5f4b96]/20 focus:border-[#5f4b96]'
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder={t('Search by name or email')}
						/>
					</label>
				</div>

				{loading ? (
					<p>{t('Loading participants...')}</p>
				) : (
					<ul className='list-none p-0 m-0'>
						{filteredUsers.length === 0 ? (
							<p className='py-2 text-gray-500'>{t('No participants found.')}</p>
						) : null}
						{filteredUsers.map((user) => {
							const isEnrolled = enrolledUserIds.has(user.user_id)
							const isProcessing = processingId === user.user_id
							return (
								<li
									key={user.user_id}
									className='flex justify-between items-center py-3 border-b border-gray-100 last:border-0'
								>
									<div>
										<strong className='block text-black'>
											{user.first_name || user.username} {user.last_name || ''}
										</strong>
										<span className='text-[0.85rem] text-gray-500'>
											{user.email}
										</span>
									</div>
									<button
										onClick={() => handleToggleEnrollment(user)}
										disabled={isProcessing}
										className={`px-4 py-2 rounded font-bold border-none transition-colors ${
											isProcessing
												? 'cursor-not-allowed opacity-50'
												: 'cursor-pointer'
										} ${
											isEnrolled
												? 'bg-red-100 text-red-800 hover:bg-red-200'
												: 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
										}`}
									>
										{isProcessing
											? t('Processing...')
											: isEnrolled
												? t('Remove')
												: t('Enroll')}
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
}

export default ParticipantModal
