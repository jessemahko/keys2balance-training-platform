import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { setUserFn, updateAvatar } from '../../reducers/userReducer'
import { setNotification, setError } from '../../reducers/notiReducer'
import Avatar from 'react-avatar-edit'
import profilePicNull from '../../assets/profile-picture-null.png'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import PropTypes from 'prop-types'

// const baseURL = ''
const baseURL = 'http://localhost:3001'

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
		dispatch(setNotification('Profile photo updated successfully.', 2))
		// setProfileImage(pview)
		setImageCrop(false)
	}

	const onBeforeFileLoad = (elem) => {
		const file = elem.target.files[0]
		// File size check: 1MB limit (in bytes)
		const maxSize = 1024 * 1024 // 1MB
		if (file.size > maxSize) {
			alert('File is too big! Max size is 1MB.')
			elem.target.value = '' // Reset the input
			return
		}
	}

	const fullName =
		`${user.first_name || ''} ${user.last_name || ''}`.trim() ||
		user.username ||
		'User'

	return (
		<div className='flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md md:flex-row md:items-center md:justify-between'>
			<div className='flex items-center gap-4'>
				{/* Photo */}
				<div className=' relative'>
					{/* picure */}
					<div
						className={`h-20 w-20 rounded-full box`}
						style={{
							// backgroundImage: user.avatarUrl ? '' : `url(${profilePicNull})`,
							backgroundImage: profileImage
								? `url(${baseURL}${profileImage})`
								: `url(${profilePicNull})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
						onClick={() => setImageCrop(true)} // Trigger cropping modal when clicked
					>
						{isHovered && (
							<div className='w-full h-full flex rounded-full items-center justify-center'>
								<div className='absolute w-full top-0 right-0 h-full  rounded-full  bg-black opacity-50'></div>
								<div className='flex text-white relative z-1000 scale-170 !opacity-100'>
									<AddAPhotoIcon fontSize='small' />
								</div>
							</div>
						)}
					</div>

					{/* Dialog and File input */}
					<Dialog
						visible={imageCrop}
						header={() => (
							<p className='text-2xl font-semibold text-slat-800 pt-4 px-10 left-0 absolute top-0 '>
								{t('Update Profile Photo')}
							</p>
						)}
						onHide={() => setImageCrop(false)}
						style={{ zIndex: 9998 }}
						className='pt-5 px-10 pb-8 bg-white !rounded-2xl border border-gray-300 shadow-lg'
					>
						<div
							className='flex flex-col items-center select-nones '
							ref={dialogRef}
						>
							<div className='mt-10 cursor-pointer avatar-crop react-avatar-edit'>
								<Avatar
									width={500}
									height={300}
									onCrop={onCrop}
									onClose={onClose}
									src={src}
									shadingColor={'#474649'}
									backgroundColor={'#474649'}
									label={t('Choose a photo')}
									labelStyle={{
										fontSize: '24px', // Adjust font size as needed
										display: 'flex', // Use flex to center label
										justifyContent: 'center',
										alignItems: 'center',
										position: 'absolute', // Position it absolutely within the Avatar
										width: '500px', // Make it take the entire width of the Avatar
										height: '300px', // Make it take the entire height of the Avatar
										textAlign: 'center', // Center the text inside the circle
										cursor: 'pointer', // Make it clickable
									}}
									onBeforeFileLoad={onBeforeFileLoad}
								/>
							</div>

							<div className='flex flex-col items-center mt-5 w-12 rounded-2xl'>
								<Button
									onClick={saveCropImage}
									label={t('Save')}
									icon='pi pi-external-link"'
									className='flex justify-around w-12 mt-4 bg-[#514587] rounded-2xl text-white w-30 h-10 text-xl'
								></Button>
							</div>
						</div>
					</Dialog>
				</div>

				<div>
					<h1 className='text-2xl font-bold text-gray-800'>{fullName}</h1>
					<p className='text-gray-500'>{user.email || 'No email'}</p>

					<div className='mt-3 flex flex-wrap gap-2'>
						<span className='rounded-full bg-[#514587] px-3 py-1 text-sm text-white capitalize'>
							{user.role || 'user'}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProfileHeader
