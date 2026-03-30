import React, { useEffect, useState, useRef, use } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ProfileHeader from '../../components/profile/ProfileHeader'
import ProfileField from '../../components/profile/ProfileField'
import PhoneDisplay from './PhoneDisplay'
import { setNotification, setError } from '../../reducers/notiReducer'
import { updateProfile } from '../../reducers/userReducer'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DangerousIcon from '@mui/icons-material/Dangerous'

import { getToken, isTokenExpired } from '../../services/authen/login'
import { rmUserFn } from '../../reducers/userReducer'
import { changePassword } from '../../services/profile'

import { isValidPhoneNumber } from 'libphonenumber-js'

const ProfilePage = () => {
	const dispatch = useDispatch()
	const { t } = useTranslation()
	const user = useSelector((state) => state.user)
	const [isEditting, setIsEditting] = useState(false)
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const [isEdittingPassword, setIsEdittingPassword] = useState(false)
	const [isAllowSave, setIsAllowSave] = useState(false)

	const [formData, setFormData] = useState({
		...user,
		date_of_birth: user.date_of_birth
			? new Date(user.date_of_birth).toISOString().split('T')[0]
			: '',
	})

	useEffect(() => {
		if (!user.first_name || !user.last_name || !user.phone) {
			setIsEditting(true)
		}
	}, [user])

	useEffect(() => {
		const passwordValidationRules = [
			newPassword.length >= 8,
			/\d/.test(newPassword),
			/[A-Z]/.test(newPassword),
			/[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
			!/\s/.test(newPassword),
			newPassword === confirmPassword,
		]

		setIsAllowSave(currentPassword && passwordValidationRules.every(Boolean))
	}, [currentPassword, newPassword, confirmPassword])

	const formatDate = (dateStr) => {
		if (!dateStr) return ''
		const d = new Date(dateStr)
		return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
			.toString()
			.padStart(2, '0')}/${d.getFullYear()}`
	}

	const handleFormChange = (e) => {
		const { name, value } = e.target

		if (name === 'phone') {
			setFormData((prev) => ({
				...prev,
				[name]: value.replace(/[^\d ]/g, '').replace(/\s+/g, ' '),
			}))
			return
		}

		if (name === 'first_name' || name === 'last_name') {
			setFormData((prev) => ({
				...prev,
				[name]: value.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' '),
			}))
			return
		}

		if (name === 'date_of_birth') {
			setFormData((prev) => ({
				...prev,
				[name]: new Date(value).toISOString().split('T')[0],
			}))
			return
		}

		setFormData((prev) => ({
			...prev,
			[name]: value.replace(/\s+/g, ' '),
		}))
	}

	const handleCancelEdit = () => {
		setIsEditting(false)
		setFormData(user)
	}

	const handleSave = async (e) => {
		e.preventDefault()
		if (!formData.phone) {
			dispatch(setError('Phone number is required', 5))
			return
		}

		if (!formData.first_name) {
			dispatch(setError('First name is required', 5))
			return
		}

		if (!formData.last_name) {
			dispatch(setError('Last name is required', 5))
			return
		}

		if (!isValidPhoneNumber(`+${formData.phone}`)) {
			dispatch(setError('Invalid phone number', 5))
			return
		}

		try {
			const profileToUpdate = {
				phone: formData.phone,
				first_name: formData.first_name,
				last_name: formData.last_name,
				gender: formData.gender || null,
				date_of_birth: formData.date_of_birth || null,
			}
			dispatch(updateProfile(profileToUpdate))

			dispatch(setNotification('Profile updated successfully', 5))
			setIsEditting(false)
		} catch (error) {
			dispatch(setError('Failed to save profile', 5))
		}
	}

	const passwordValidationList = [
		{
			condition: newPassword.length < 8,
			message: 'Password must be at least 8 characters',
		},
		{
			condition: !/\d/.test(newPassword),
			message: 'Password must contain at least one number',
		},
		{
			condition: !/[A-Z]/.test(newPassword),
			message: 'Password must contain a capital letter',
		},
		{
			condition: !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
			message: 'Password must contain at least one special character',
		},
		{
			condition: /\s/.test(newPassword),
			message: 'Password must not contain whitespace',
		},
	]

	const handleCancelEditPassword = () => {
		setCurrentPassword('')
		setNewPassword('')
		setConfirmPassword('')
		setIsPasswordVisible(false)
	}
	const handleSavePassword = async (e) => {
		e.preventDefault()
		if (isTokenExpired(getToken())) {
			dispatch(rmUserFn())
			return
		}

		try {
			const res = await changePassword({
				oldPassword: currentPassword,
				newPassword: newPassword,
			})

			if (res.success) {
				dispatch(setNotification('Password updated successfully', 5))
				handleCancelEditPassword()
			} else {
				dispatch(setError(res.error || 'Failed to update password', 5))
				return
			}
		} catch (error) {
			dispatch(setError('Failed to update password', 5))
		}
	}
	return (
		<div className='min-h-screen bg-gray-100 p-4 md:p-8'>
			<div className='mx-auto max-w-6xl space-y-6'>
				<ProfileHeader profile={user} />

				<div className='rounded-2xl bg-white p-6 shadow-md'>
					<div className='space-y-8'>
						{/* Security */}
						{!user.is_login_with_google && (
							<div className={`${isEdittingPassword ? 'border-b pb-10' : ''}`}>
								<div className='flex gap-4'>
									<h3 className='mb-4 text-lg font-semibold text-gray-800'>
										{t('Security')}
									</h3>
									{isEdittingPassword ? (
										<>
											{isPasswordVisible ? (
												<VisibilityIcon
													className='cursor-pointer text-gray-700 hover:text-gray-500 transition mt-1'
													onClick={() => setIsPasswordVisible(false)}
												/>
											) : (
												<VisibilityOffIcon
													className='cursor-pointer text-gray-700 hover:text-gray-500 transition mt-1'
													onClick={() => setIsPasswordVisible(true)}
												/>
											)}
										</>
									) : (
										<EditIcon
											className='cursor-pointer text-gray-700 hover:text-gray-500 transition'
											onClick={() => setIsEdittingPassword(true)}
										/>
									)}
								</div>
								<div className='grid grid-cols-1 gap-4'>
									{isEdittingPassword ? (
										<>
											<ProfileField
												label={t('Current Password')}
												name='currentPassword'
												type={isPasswordVisible ? 'text' : 'password'}
												value={currentPassword}
												onChange={(e) => setCurrentPassword(e.target.value)}
												required={true}
											/>
											<ProfileField
												label={t('New Password')}
												name='newPassword'
												type={isPasswordVisible ? 'text' : 'password'}
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												required={true}
											/>
											<ul className='list-disc pl-10'>
												{passwordValidationList.map((v) => (
													<li
														key={v.message}
														className={`text-sm ${v.condition ? 'text-red-500' : 'text-green-500'}`}
													>
														{t(v.message)}
													</li>
												))}
											</ul>
											<ProfileField
												label={t('Confirm Password')}
												name='confirmPassword'
												type={isPasswordVisible ? 'text' : 'password'}
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												required={true}
												icon={
													confirmPassword.length === 0 &&
													newPassword.length === 0 ? null : newPassword ===
													  confirmPassword ? (
														<CheckCircleIcon className='text-green-500' />
													) : (
														<DangerousIcon className='text-red-500' />
													)
												}
											/>

											<div className='flex flex-wrap gap-4 pt-2 justify-center'>
												<button
													type='submit'
													className={`${isAllowSave ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'} rounded-xl bg-[#514587] px-6 py-3 font-semibold text-white transition `}
													onClick={handleSavePassword}
													disabled={!isAllowSave}
												>
													{t('Save')}
												</button>

												<button
													type='button'
													onClick={handleCancelEditPassword}
													className='rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50'
												>
													{t('Cancel')}
												</button>
											</div>
										</>
									) : (
										<ProfileField
											label={t('Password')}
											name='password'
											type='password'
											value='********'
											disabled
										/>
									)}
								</div>
							</div>
						)}

						{/* Basic Information */}
						<div className={`${isEdittingPassword ? 'opacity-20' : ''}`}>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								{t('Basic Information')}
							</h3>

							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField
									label={t('Username')}
									name='username'
									value={formData.username || ''}
									onChange={handleFormChange}
									disabled
								/>
								<ProfileField
									label={t('Email')}
									name='email'
									value={formData.email || ''}
									onChange={handleFormChange}
									placeholder='Enter your email'
									required={true}
									disabled
								/>
								<ProfileField
									label={t('Role')}
									name='role'
									value={formData.role || ''}
									onChange={handleFormChange}
									disabled
								/>
								{isEditting ? (
									<ProfileField
										label={t('Phone')}
										name='phone'
										type='text'
										value={formData.phone ? `+${formData.phone}` : ''}
										onChange={handleFormChange}
										disabled={isEdittingPassword || !isEditting}
										placeholder={isEditting ? 'eg. +358 123 4567' : ''}
										required={true}
										maxLength={15}
									/>
								) : (
									<PhoneDisplay />
								)}
							</div>
						</div>

						{/* Personal Details */}
						<div className={`${isEdittingPassword ? 'opacity-20' : ''}`}>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								{t('Personal Details')}
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField
									label={t('First Name')}
									name='first_name'
									value={formData.first_name || ''}
									onChange={handleFormChange}
									disabled={isEdittingPassword || !isEditting}
									required={true}
									placeholder={t('Enter your first name')}
									error={formData.first_name === ''}
									errorMessage={t('First name is required')}
								/>
								<ProfileField
									label={t('Last Name')}
									name='last_name'
									value={formData.last_name || ''}
									onChange={handleFormChange}
									disabled={isEdittingPassword || !isEditting}
									required={true}
									placeholder={t('Enter your last name')}
									error={formData.last_name === ''}
									errorMessage={t('Last name is required')}
								/>
								<ProfileField
									label={t('Gender')}
									name='gender'
									value={formData.gender || ''}
									onChange={handleFormChange}
									disabled={isEdittingPassword || !isEditting}
								/>
								<ProfileField
									label={t('Date of Birth')}
									name='date_of_birth'
									type='date'
									value={formData.date_of_birth || ''}
									onChange={handleFormChange}
									disabled={isEdittingPassword || !isEditting}
								/>
							</div>
						</div>

						{/* Actions */}

						{isEditting ? (
							<div
								className={`flex flex-wrap gap-4 pt-2 ${isEdittingPassword ? 'opacity-20' : ''}`}
							>
								<button
									type='button'
									className='rounded-xl bg-[#514587] px-6 py-3 font-semibold text-white transition hover:opacity-90 mt-5'
									disabled={isEdittingPassword}
									onClick={handleSave}
								>
									{t('Save Changes')}
								</button>
								<button
									type='button'
									onClick={handleCancelEdit}
									className='rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 mt-5'
									disabled={isEdittingPassword}
								>
									{t('Cancel')}
								</button>
							</div>
						) : (
							<div className='flex w-full justify-center'>
								<button
									type='button'
									className='rounded-xl bg-[#514587] px-6 py-3 font-semibold text-white transition hover:opacity-90 mt-5'
									disabled={isEdittingPassword}
									onClick={() => setIsEditting(true)}
								>
									{t('Edit Profile')}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProfilePage
