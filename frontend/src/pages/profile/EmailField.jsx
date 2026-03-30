import PropTypes from 'prop-types'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle'
import CheckIcon from '@mui/icons-material/Check'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'

import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setNotification, setError } from '../../reducers/notiReducer'
import { updateProfile } from '../../reducers/userReducer'
import { useDispatch } from 'react-redux'

const ProfileField = ({ disabled }) => {
	const dispatch = useDispatch()
	const { t } = useTranslation()
	const user = useSelector((state) => state.user)
	const [isConfirming, setIsConfirming] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [email, setEmail] = useState(user.email || '')
	const [isHoveringVerification, setIsHoveringVerification] = useState(false)
	const [isSending, setIsSending] = useState(false)

	const containerRef = useRef(null)

	const onCancelEdit = () => {
		setIsEditing(false)
		setEmail(user.email || '')
	}

	useEffect(() => {
		setEmail(user.email || '')
	}, [user.email])

	const updateEmail = async () => {
		if (email === user.email) {
			setIsEditing(false)
			return
		}

		if (!email) {
			dispatch(setError('Email cannot be empty.', 5))
			return
		}

		if (!/\S+@\S+\.\S+/.test(email)) {
			dispatch(setError('Please enter a valid email address.', 5))
			return
		}
		setIsConfirming(true)
		const ok = window.confirm(
			t(
				'Are you sure you want to update your email? This action will mark your email as unverified.',
			),
		)

		setTimeout(() => {
			setIsConfirming(false)
		}, 500) // Ensure the confirm dialog has fully closed before proceeding

		setTimeout(() => {
			const input = document.querySelector(`input[name="email"]`)
			if (input) {
				input.focus()
			}
		}, 0)
		if (!ok) {
			return
		}

		try {
			await dispatch(updateProfile({ email }))
			setIsEditing(false)
		} catch (err) {
			dispatch(
				setError(
					err.response?.data?.error || err.message || 'Failed to update email',
					5,
				),
			)
		}
	}

	const handleSendVerification = async () => {
		if (isSending) return // prevent multiple clicks

		setIsSending(true)
		try {
			// await dispatch(sendVerificationEmail()) // or your function
			dispatch(setNotification('Verification email sent!', 5))
		} catch (err) {
			dispatch(
				setError(
					err.response?.data?.error ||
						err.message ||
						'Failed to send verification email',
					5,
				),
			)
		} finally {
			// cooldown 20s before allowing next click
			setTimeout(() => setIsSending(false), 20000)
		}
	}
	return (
		<div
			className='flex flex-col gap-2 relative'
			ref={containerRef}
			onBlur={(e) => {
				if (isConfirming) return
				if (!containerRef.current.contains(e.relatedTarget)) {
					onCancelEdit()
				}
			}}
		>
			<div className='flex justify-between'>
				<div className='flex gap-5'>
					<label className='text-sm font-semibold text-gray-700'>
						{t('Email')}
					</label>

					{isEditing ? (
						<div className='flex gap-3'>
							<CheckIcon
								tabIndex={0}
								fontSize='small'
								className='cursor-pointer text-gray-700 hover:text-gray-500 transition'
								onClick={disabled ? null : updateEmail}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										disabled ? null : updateEmail()
									}
									if (e.key === 'Escape') {
										disabled ? null : onCancelEdit()
									}
								}}
							/>
							<CloseIcon
								tabIndex={0}
								fontSize='small'
								className='cursor-pointer text-gray-700 hover:text-gray-500 transition'
								onClick={disabled ? null : onCancelEdit}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										disabled ? null : onCancelEdit()
									}
									if (e.key === 'Escape') {
										disabled ? null : onCancelEdit()
									}
								}}
							/>
						</div>
					) : (
						<EditIcon
							tabIndex={0}
							fontSize='small'
							className='cursor-pointer text-gray-700 hover:text-gray-500 transition'
							onClick={
								disabled
									? null
									: () => {
											setIsEditing(true)
											// focus the input field after clicking the edit icon
											setTimeout(() => {
												const input =
													document.querySelector(`input[name="email"]`)
												if (input) {
													input.focus()
												}
											}, 0)
										}
							}
						/>
					)}
				</div>

				{!email && (
					<span className='text-sm font-semibold text-red-500 ml-2'>
						*{'  '}required
					</span>
				)}

				{email && (
					<span className='ml-2'>
						{user.is_verified ? (
							<div className='flex items-center gap-1 ml-2 text-green-500'>
								<VerifiedUserIcon fontSize='small' />
							</div>
						) : (
							<div className='flex items-center gap-1 ml-2 text-red-500'>
								<NewReleasesIcon fontSize='small' /> unverified
							</div>
						)}
					</span>
				)}
			</div>
			<div className='relative'>
				<input
					className={`rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#514587] focus:ring-2 focus:ring-[#9484b4] disabled:bg-gray-100 disabled:text-gray-500 w-full  pr-15`}
					type='email'
					name='email'
					value={email || ''}
					onChange={(e) => setEmail(e.target.value)}
					disabled={!isEditing}
					placeholder={isEditing ? t('eg. example@example.com') : ''}
					required
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							updateEmail()
						}
						if (e.key === 'Escape') {
							onCancelEdit()
						}
					}}
					onBlur={(e) => {
						const next = e.relatedTarget
						if (!e.currentTarget.parentNode.contains(next)) {
							onCancelEdit()
						}
					}}
				/>

				{!user.is_verified && (
					<div
						className={`absolute right-3 top-1/2 -translate-y-1/2 ${
							user.is_verified || isSending ? 'text-gray-400' : 'text-red-500'
						} cursor-pointer hover:text-gray-600 transition  ${isSending ? 'cursor-not-allowed' : ''}`}
						tabIndex={0}
						onClick={
							disabled || isSending || !email ? null : handleSendVerification
						}
						onMouseEnter={() => setIsHoveringVerification(true)}
						onMouseLeave={() => setIsHoveringVerification(false)}
					>
						{isSending ? (
							<MarkEmailReadIcon fontSize='medium' />
						) : (
							<MailOutlineIcon fontSize='medium' />
						)}
						{isHoveringVerification && !isSending && (
							<span className='absolute -bottom-8 right-0 bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap'>
								{t('Send verification email')}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

ProfileField.propTypes = {
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func,
	type: PropTypes.string,
	disabled: PropTypes.bool,
	placeholder: PropTypes.string,
	icon: PropTypes.node,
	editEmail: PropTypes.func,
	verified: PropTypes.bool,
}

export default ProfileField

