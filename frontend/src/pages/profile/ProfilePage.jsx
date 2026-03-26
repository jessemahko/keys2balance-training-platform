import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ProfileHeader from '../../components/profile/ProfileHeader'
import ProfileField from '../../components/profile/ProfileField'
import { setNotification, setError } from '../../reducers/notiReducer'
import { updateProfile } from '../../reducers/userReducer'

const ProfilePage = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)

	const [formData, setFormData] = useState(user)

	// Handle update avatar
	useEffect(() => {
		window.localStorage.setItem('loggedUser', JSON.stringify(user))
	}, [user])

	// Detect click outside of the dialog

	const formatDate = (dateStr) => {
		const d = new Date(dateStr)
		return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
			.toString()
			.padStart(2, '0')}/${d.getFullYear()}`
	}

	const handleFormChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleReset = () => {
		setFormData(user)
		dispatch(setNotification('Form reset successfully', 2))
	}

	const handleSave = async (e) => {
		e.preventDefault()

		try {
			//const updatedProfile = formData;
			dispatch(updateProfile(formData))
			dispatch(setNotification('Profile updated successfully', 2))
		} catch (error) {
			dispatch(setError('Failed to save profile', 2))
		}
	}

	return (
		<div className='min-h-screen bg-gray-100 p-4 md:p-8'>
			<div className='mx-auto max-w-6xl space-y-6'>
				<ProfileHeader profile={user} />

				<div className='rounded-2xl bg-white p-6 shadow-md'>
					<form onSubmit={handleSave} className='space-y-8'>
						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Basic Information
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField
									label='Username'
									name='username'
									value={formData.username || ''}
									onChange={handleFormChange}
									disabled
								/>
								<ProfileField
									label='Email'
									name='email'
									value={formData.email || ''}
									onChange={handleFormChange}
									disabled
								/>
								<ProfileField
									label='Role'
									name='role'
									value={formData.role || ''}
									onChange={handleFormChange}
									disabled
								/>
								<ProfileField
									label='Phone'
									name='phone'
									value={formData.phone || ''}
									onChange={handleFormChange}
								/>
							</div>
						</div>

						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Personal Details
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField
									label='First Name'
									name='first_name'
									value={formData.first_name || ''}
									onChange={handleFormChange}
								/>
								<ProfileField
									label='Last Name'
									name='last_name'
									value={formData.last_name || ''}
									onChange={handleFormChange}
								/>
								<ProfileField
									label='Gender'
									name='gender'
									value={formData.gender || ''}
									onChange={handleFormChange}
								/>
								<ProfileField
									label='Date of Birth'
									name='date_of_birth'
									type='date'
									value={formData.date_of_birth || ''}
									onChange={handleFormChange}
								/>
							</div>
						</div>

						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Address Information
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField
									label='Address'
									name='address'
									value={formData.address || ''}
									onChange={handleFormChange}
								/>
								<ProfileField
									label='City'
									name='city'
									value={formData.city || ''}
									onChange={handleFormChange}
								/>
								<ProfileField
									label='Post Code'
									name='post_code'
									value={formData.post_code || ''}
									onChange={handleFormChange}
								/>
								<ProfileField
									label='Country'
									name='country'
									value={formData.country || ''}
									onChange={handleFormChange}
								/>
							</div>
						</div>

						<div className='flex flex-wrap gap-4 pt-2'>
							<button
								type='submit'
								className='rounded-xl bg-[#514587] px-6 py-3 font-semibold text-white transition hover:opacity-90'
							>
								Save Changes
							</button>

							<button
								type='button'
								onClick={handleReset}
								className='rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50'
							>
								Reset
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default ProfilePage
