import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ProfileHeader from '../../components/profile/ProfileHeader'
import ProfileField from '../../components/profile/ProfileField'
import { setNotification, setError } from '../../reducers/notiReducer'

const mockParticipantProfile = {
	user_id: 'local-participant-id',
	username: 'student1',
	email: 'student1@test.com',
	role: 'participant',
	is_verified: true,
	is_active: true,
	first_name: 'Alice',
	last_name: 'Brown',
	gender: 'female',
	date_of_birth: '2000-01-01',
	phone: '+358402222222',
	address: 'Student Road 10',
	city: 'Vantaa',
	post_code: '01300',
	country: 'Finland',
	avatar_url: '',
	created_at: '2026-03-18T10:00:00.000Z',
	updated_at: '2026-03-18T10:00:00.000Z',
	enrolled_courses: 2,
	completed_lessons: 4,
	progress_status: 'In Progress',
}

const ParticipantProfile = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)

	const [profile, setProfile] = useState(mockParticipantProfile)
	const [formData, setFormData] = useState(mockParticipantProfile)

	useEffect(() => {
		if (user) {
			const mergedProfile = {
				...mockParticipantProfile,
				email: user.email || mockParticipantProfile.email,
				role: user.role || mockParticipantProfile.role,
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
					'Participant profile saved locally. Backend profile API not ready yet.',
					2,
				),
			)
		} catch (error) {
			dispatch(setError('Failed to save participant profile', 2))
		}
	}

	return (
		<div className='min-h-screen bg-gray-100 p-4 md:p-8'>
			<div className='mx-auto max-w-6xl space-y-6'>
				<ProfileHeader profile={formData} />

				<div className='rounded-2xl bg-white p-6 shadow-md'>
					<div className='mb-6'>
						<h2 className='text-2xl font-bold text-gray-800'>
							Participant Profile
						</h2>
						<p className='text-sm text-gray-500'>
							Manage your participant account information
						</p>
					</div>

					<form onSubmit={handleSave} className='space-y-8'>
						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Basic Information
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField label='Username' name='username' value={formData.username} onChange={handleChange} disabled />
								<ProfileField label='Email' name='email' value={formData.email} onChange={handleChange} disabled />
								<ProfileField label='Role' name='role' value={formData.role} onChange={handleChange} disabled />
								<ProfileField label='Avatar URL' name='avatar_url' value={formData.avatar_url} onChange={handleChange} />
							</div>
						</div>

						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Personal Details
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField label='First Name' name='first_name' value={formData.first_name} onChange={handleChange} />
								<ProfileField label='Last Name' name='last_name' value={formData.last_name} onChange={handleChange} />
								<ProfileField label='Gender' name='gender' value={formData.gender} onChange={handleChange} />
								<ProfileField label='Date of Birth' name='date_of_birth' type='date' value={formData.date_of_birth} onChange={handleChange} />
								<ProfileField label='Phone' name='phone' value={formData.phone} onChange={handleChange} />
							</div>
						</div>

						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Learning Information
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField label='Enrolled Courses' name='enrolled_courses' value={formData.enrolled_courses} onChange={handleChange} disabled />
								<ProfileField label='Completed Lessons' name='completed_lessons' value={formData.completed_lessons} onChange={handleChange} disabled />
								<ProfileField label='Progress Status' name='progress_status' value={formData.progress_status} onChange={handleChange} disabled />
							</div>
						</div>

						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Address Information
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField label='Address' name='address' value={formData.address} onChange={handleChange} />
								<ProfileField label='City' name='city' value={formData.city} onChange={handleChange} />
								<ProfileField label='Post Code' name='post_code' value={formData.post_code} onChange={handleChange} />
								<ProfileField label='Country' name='country' value={formData.country} onChange={handleChange} />
							</div>
						</div>

						<div className='flex flex-wrap gap-4 pt-2'>
							<button type='submit' className='rounded-xl bg-[#514587] px-6 py-3 font-semibold text-white transition hover:opacity-90'>
								Save Changes
							</button>
							<button type='button' onClick={handleReset} className='rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50'>
								Reset
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default ParticipantProfile