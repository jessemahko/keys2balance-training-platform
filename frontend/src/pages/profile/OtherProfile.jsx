import React, { useEffect, useState, useRef, use } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'

import ProfileHeader from '../../components/profile/ProfileHeader'
import PhoneDisplay from './PhoneDisplay'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import { getProfile } from '../../services/profile'

const OtherProfile = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const state = location.state
	const { userId } = useParams()
	const { t } = useTranslation()
	const [isLoading, setIsLoading] = useState(true)
	const [user, setUser] = useState(null)

	useEffect(() => {
		document.title = t('Profile')
		const loadUser = async () => {
			try {
				const data = await getProfile(userId)
				setUser(data)
			} catch (error) {
				navigate(state?.from || '/dashboard')
				dispatch(
					setError(
						t(
							error.response?.data?.error ||
								error.message ||
								'Failed to load user profile',
						),
						5,
					),
				)
			} finally {
				setIsLoading(false)
			}
		}

		loadUser()
	}, [])

	if (isLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-100'>
				<p className='text-gray-500'>{t('Loading profile...')}</p>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-100 p-4 md:p-8'>
			<div className='mx-auto max-w-6xl space-y-6'>
				<div
					className='flex items-center gap-2 text-[#4d458d] cursor-pointer font-bold border-b-2 border-transparent hover:border-[#4d458d] w-max'
					onClick={() =>
						navigate(state?.from || '/dashboard', {
							state: { openEnrollment: state?.openEnrollment || false },
						})
					}
				>
					<KeyboardBackspaceIcon />
					{t('Back')}
				</div>
				<ProfileHeader user={user} />

				<div className='rounded-2xl bg-white p-6 shadow-md'>
					<div className='space-y-8'>
						{/* Basic Information */}
						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								{t('Basic Information')}
							</h3>

							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<Field label={t('Email')} value={user?.email} />

								{user?.phone ? (
									<PhoneDisplay user={user} />
								) : (
									<Field label={t('Phone')} value={user?.phone} />
								)}
							</div>
						</div>

						{/* Personal Details */}
						<div>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								{t('Personal Details')}
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<Field label={t('First Name')} value={user?.first_name} />
								<Field label={t('Last Name')} value={user?.last_name} />
								<Field label={t('Gender')} value={user?.gender} />
								<Field label={t('Date of Birth')} value={user?.date_of_birth} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

const Field = ({ label, value }) => {
	const { t } = useTranslation()
	return (
		<div className='flex flex-col gap-2 relative'>
			<div className='flex justify-between'>
				<label className='text-sm font-semibold text-gray-700'>
					{t(label)}
				</label>
			</div>

			<div
				className={`rounded-xl border border-gray-300 px-4 py-3 outline-none transition bg-gray-100 text-gray-500 `}
			>
				{t(value) || (
					<span className='text-gray-500 italic'>{t('Not provided')}</span>
				)}
			</div>
		</div>
	)
}

export default OtherProfile
