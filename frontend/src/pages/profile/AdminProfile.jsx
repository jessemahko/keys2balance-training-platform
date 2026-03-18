import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ProfileHeader from '../../components/profile/ProfileHeader'
import ProfileField from '../../components/profile/ProfileField'
import { setNotification, setError } from '../../reducers/notiReducer'

const mockAdminProfile = {
	user_id: 'local-admin-id',
	username: 'admin1',
	email: 'admin1@test.com',
	role: 'admin',
	is_verified: true,
	is_active: true,
	first_name: 'Admin',
	last_name: 'User',
	gender: 'Prefer not to say',
	date_of_birth: '1995-01-01',
	phone: '+358401234567',
	address: 'Test Street 1',
	city: 'Helsinki',
	post_code: '00100',
	country: 'Finland',
	avatar_url: '',
	created_at: '2026-03-18T10:00:00.000Z',
	updated_at: '2026-03-18T10:00:00.000Z',
}

const AdminProfile = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)

	const [profile, setProfile] = useState(mockAdminProfile)
	const [formData, setFormData] = useState(mockAdminProfile)

	useEffect(() => {
		if (user) {
			const mergedProfile = {
				...mockAdminProfile,
				email: user.email || mockAdminProfile.email,
				role: user.role || mockAdminProfile.role,
			}
			setProfile(mergedProfile)
			setFormData(mergedProfile)
		}
	}, [user])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const handleReset = () => {
		setFormData(profile)
		dispatch(setNotification('Form reset successfully', 2))
	}

	const handleSave = (e) => {
		e.preventDefault()

		try {
			setProfile(formData)
			dispatch(
				setNotification(
					'Profile saved locally. Backend profile API not ready yet.',
					2,
				),
			)
		} catch (error) {
			dispatch(setError('Failed to save profile', 2))
		}
	}

	return (
		<div className='min-h-screen bg-gray-100 p-4 md:p-8'>
			<div className='mx-auto max-w-6xl space-y-6'>
				<ProfileHeader profile={formData} />

				<div className='rounded-2xl bg-white p-6 shadow-md'>
					<div className='mb-6'>
						<h2 className='text-2xl font-bold text-gray-800'>
							Admin Profile
						</h2>
						<p className='text-sm text-gray-500'>
							Manage your account information
						</p>
					</div>

					<form onSubmit={handleSave} className='space-y-8'>
						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Basic Information
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField
									label='Username'
									name='username'
									value={formData.username}
									onChange={handleChange}
									disabled
								/>
								<ProfileField
									label='Email'
									name='email'
									value={formData.email}
									onChange={handleChange}
									disabled
								/>
								<ProfileField
									label='Role'
									name='role'
									value={formData.role}
									onChange={handleChange}
									disabled
								/>
								<ProfileField
									label='Avatar URL'
									name='avatar_url'
									value={formData.avatar_url}
									onChange={handleChange}
									placeholder='https://example.com/avatar.png'
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
									value={formData.first_name}
									onChange={handleChange}
								/>
								<ProfileField
									label='Last Name'
									name='last_name'
									value={formData.last_name}
									onChange={handleChange}
								/>
								<ProfileField
									label='Gender'
									name='gender'
									value={formData.gender}
									onChange={handleChange}
								/>
								<ProfileField
									label='Date of Birth'
									name='date_of_birth'
									type='date'
									value={formData.date_of_birth}
									onChange={handleChange}
								/>
								<ProfileField
									label='Phone'
									name='phone'
									value={formData.phone}
									onChange={handleChange}
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
									value={formData.address}
									onChange={handleChange}
								/>
								<ProfileField
									label='City'
									name='city'
									value={formData.city}
									onChange={handleChange}
								/>
								<ProfileField
									label='Post Code'
									name='post_code'
									value={formData.post_code}
									onChange={handleChange}
								/>
								<ProfileField
									label='Country'
									name='country'
									value={formData.country}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								System Information
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField
									label='Created At'
									name='created_at'
									value={
										formData.created_at
											? new Date(formData.created_at).toLocaleString()
											: ''
									}
									disabled
								/>
								<ProfileField
									label='Updated At'
									name='updated_at'
									value={
										formData.updated_at
											? new Date(formData.updated_at).toLocaleString()
											: ''
									}
									disabled
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

export default AdminProfile