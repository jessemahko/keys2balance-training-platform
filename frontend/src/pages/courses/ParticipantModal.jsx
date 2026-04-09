import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { setUsersFn } from '../../reducers/usersReducer'
import { toggleEnrollmentFn } from '../../reducers/courseReducer'
import { useTranslation } from 'react-i18next'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch'
import profilePicNull from '../../assets/profile-picture-null.png'
import { API_BASE_URL } from '../../services/apiConfig'

const ParticipantModal = ({ isOpen, onClose }) => {
	const { t } = useTranslation()
	const { courseId } = useParams()
	const location = useLocation()
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const modalRef = useRef()
	const course =
		useSelector((state) =>
			state.course.items.find((c) => String(c.course_id) === String(courseId)),
		) || {}
	const allUsers = useSelector((state) => state.users) || []
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [processingId, setProcessingId] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const debouncedSearchTerm = useDebouncedSearch(searchTerm)

	const filteredUsers = allUsers
		.filter((user) => {
			if (user.role === 'admin' || user.role === 'trainer') return false
			const searchLower = debouncedSearchTerm.toLowerCase()
			const fullName =
				`${user.first_name || user.username} ${user.last_name || ''}`.toLowerCase()
			const email = (user.email || '').toLowerCase()

			const notTeacher = user.user_id !== course.teacher_id
			return (
				(fullName.includes(searchLower) || email.includes(searchLower)) &&
				notTeacher
			)
		})
		.sort((a, b) => {
			const searchLower = debouncedSearchTerm.toLowerCase()
			const fullNameA =
				`${a.first_name || a.username} ${a.last_name || ''}`.toLowerCase()
			const fullNameB =
				`${b.first_name || b.username} ${b.last_name || ''}`.toLowerCase()
			const emailA = (a.email || '').toLowerCase()
			const emailB = (b.email || '').toLowerCase()

			const indexA = Math.min(
				fullNameA.indexOf(searchLower) === -1
					? Infinity
					: fullNameA.indexOf(searchLower),
				emailA.indexOf(searchLower) === -1
					? Infinity
					: emailA.indexOf(searchLower),
			)
			const indexB = Math.min(
				fullNameB.indexOf(searchLower) === -1
					? Infinity
					: fullNameB.indexOf(searchLower),
				emailB.indexOf(searchLower) === -1
					? Infinity
					: emailB.indexOf(searchLower),
			)

			if (indexA !== indexB) return indexA - indexB
			return fullNameA.localeCompare(fullNameB)
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

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

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
			<div
				className='bg-white p-8 rounded-lg w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto'
				ref={modalRef}
			>
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
							<p className='py-2 text-gray-500'>
								{t('No participants found.')}
							</p>
						) : null}
						{filteredUsers.map((user) => {
							const isEnrolled = enrolledUserIds.has(user.user_id)
							const isProcessing = processingId === user.user_id
							const resolvedProfileImageUrl = user.avatar_url
								? user.avatar_url.startsWith('http://') ||
									user.avatar_url.startsWith('https://')
									? user.avatar_url
									: `${API_BASE_URL}${user.avatar_url}`
								: profilePicNull
							return (
								<li
									key={user.user_id}
									className='flex justify-between items-center py-3 border-b border-gray-100 last:border-0'
								>
									<div className='flex flex-1 items-center gap-3 min-w-0 mr-5'>
										<div
											className='w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer hover:opacity-60'
											onClick={() =>
												navigate(`/profile/${user.user_id}`, {
													state: {
														from: location.pathname,
														openEnrollment: true,
													},
												})
											}
										>
											<img
												src={resolvedProfileImageUrl}
												alt={user.first_name || user.username}
												className='w-full h-full object-cover'
											/>
										</div>

										<div className='min-w-0 flex flex-col'>
											<strong className='block text-black truncate'>
												{user.first_name || user.username}{' '}
												{user.last_name || ''}
											</strong>

											<span className='text-[0.85rem] text-gray-500 truncate'>
												{user.email || t('No email')}
											</span>
										</div>
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
