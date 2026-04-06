import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { setUserFn, updateAvatar } from '../../reducers/userReducer'
import { setNotification, setError } from '../../reducers/notiReducer'
import Avatar from 'react-avatar-edit'
import profilePicNull from '../../assets/profile-picture-null.png'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'

import WarningIcon from '@mui/icons-material/Warning'

import NewReleasesIcon from '@mui/icons-material/NewReleases'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import PropTypes from 'prop-types'
import { API_BASE_URL } from '../../services/apiConfig'

const ProfileHeader = () => {
	const dispatch = useDispatch()
	const { t } = useTranslation()
	const user = useSelector((state) => state.user)
	const [isHovered, setIsHovered] = useState(false)
	const [imageCrop, setImageCrop] = useState(false) // to control the cropping dialog
	const [src, setSrc] = useState(null) // source for the avatar image
	const [pview, setPview] = useState(null) // cropped image preview
	const dialogRef = useRef(null)

	const [profileImage, setProfileImage] = useState(user.avatar_url || null)

	const avatarUrl = user.avatar_url
	const resolvedProfileImageUrl = profileImage
		? profileImage.startsWith('http://') || profileImage.startsWith('https://')
			? profileImage
			: `${API_BASE_URL}${profileImage}`
		: profilePicNull

	const isMissingProfileFields =
		!user.first_name || !user.last_name || !user.phone
	const isMissingEmail = !user.email

	useEffect(() => {
		if (avatarUrl) {
			setProfileImage(`${avatarUrl}`) // Make sure the URL is absolute and points to your server
		}
	}, [user])

	useEffect(() => {
		const handleClickOutside = (event) => {
			// Check if the dialog is rendered
			if (dialogRef.current) {
				const dialogRect = dialogRef.current.getBoundingClientRect()

				// Get mouse click position
				const mouseX = event.clientX
				const mouseY = event.clientY

				// Calculate the distance from the click to the dialog's nearest edge
				const distanceTop = dialogRect.top - mouseY
				const distanceBottom = mouseY - dialogRect.bottom
				const distanceLeft = dialogRect.left - mouseX
				const distanceRight = mouseX - dialogRect.right

				// Check if the click is outside and the distance from the edge is greater than 100px
				if (
					distanceTop > 34 ||
					distanceBottom > 34 ||
					distanceLeft > 41 ||
					distanceRight > 41
				) {
					closeDialog()
				}
			}
		}
		document.addEventListener('mousedown', handleClickOutside)

		if (user.avatar_url !== null) setProfileImage(`${avatarUrl}`)

		// Cleanup the event listener on component unmount
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const closeDialog = () => {
		setImageCrop(false)
	}
	const onClose = () => {
		setPview(null)
	}

	const onCrop = (view) => {
		setPview(view)
	}
	const saveCropImage = () => {
		// Convert base64 image to a File object
		const base64Image = pview.split(',')[1] // Remove the base64 prefix
		const byteArray = new Uint8Array(
			atob(base64Image)
				.split('')
				.map((char) => char.charCodeAt(0)),
		)
		const file = new File([byteArray], 'avatar.png', { type: 'image/png' })

		// Dispatch updateAvatar to upload the cropped image
		dispatch(updateAvatar(file))
		dispatch(setNotification('Profile photo updated successfully.', 5))
		// setProfileImage(pview)
		setImageCrop(false)
	}

	const onBeforeFileLoad = (elem) => {
		const file = elem.target.files[0]
		// File size check: 1MB limit (in bytes)
		const maxSize = 1024 * 1024 // 1MB
		if (file.size > maxSize) {
			alert(t('File is too big! Max size is 1MB.'))
			elem.target.value = '' // Reset the input
			return
		}
	}

	const fullName =
		`${user.first_name || ''} ${user.last_name || ''}`.trim() ||
		user.username ||
		t('User')

	return (
		<div className='flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-4 rounded-2xl bg-white p-6 shadow-md relative'>
			{/* Profile Section */}
			<div className='flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap w-full md:w-auto'>
				{/* Avatar */}
				<div className='relative flex-shrink-0'>
					<div
						className='h-20 w-20 rounded-full box'
						style={{
							backgroundImage: `url(${resolvedProfileImageUrl})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
						onClick={() => setImageCrop(true)}
					>
						{isHovered && (
							<div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/50'>
								<AddAPhotoIcon
									className='text-white scale-125'
									fontSize='small'
								/>
							</div>
						)}
					</div>
				</div>

				{/* Name, Email, Role */}
				<div className='flex flex-col min-w-0'>
					<h1 className='text-2xl font-bold text-gray-800 truncate'>
						{fullName}
					</h1>
					<div className='flex flex-wrap items-center gap-1'>
						<p className='text-gray-500 truncate'>
							{user.email || t('No email')}
						</p>
						{user.is_verified ? (
							<VerifiedUserIcon className='text-green-500' fontSize='small' />
						) : (
							<NewReleasesIcon className='text-red-500' fontSize='small' />
						)}
					</div>
					<div className='mt-3 flex flex-wrap gap-2'>
						<span className='rounded-full bg-[#514587] px-3 py-1 text-sm text-white capitalize'>
							{user.role || t('user')}
						</span>
					</div>
				</div>
			</div>

			{/* Warning for missing Profile fields */}

			<div className='flex flex-col md:self-end'>
				{!user.is_verified && (
					<div className='flex items-center gap-2 rounded-lg bg-red-100 px-4 py-3 text-red-700 w-full md:w-auto '>
						<WarningIcon fontSize='small' />
						<p className='whitespace-normal break-words'>
							{isMissingEmail
								? t('Fill your email using the red edit button below.')
								: t(
										'Your email is not verified. Please verify your email to access all features.',
									)}
						</p>
					</div>
				)}
				{isMissingProfileFields && (
					<div className='flex items-center gap-2 rounded-lg bg-red-100 px-4 py-3 text-red-700 w-full md:w-auto mt-2'>
						<WarningIcon fontSize='small' />
						<p className=''>
							{t(
								'Fill required fields using the button at the bottom of the page.',
							)}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default ProfileHeader
