import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ProfileHeader from '../../components/profile/ProfileHeader'
import ProfileField from '../../components/profile/ProfileField'
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

const ProfilePage = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const [isEdittingPassword, setIsEdittingPassword] = useState(false)
	const [isAllowSave, setIsAllowSave] = useState(false)

	const [formData, setFormData] = useState(user)

	// Detect click outside of the dialog

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
		setIsEdittingPassword(false)
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
				dispatch(setNotification('Password updated successfully', 2))
				handleCancelEditPassword()
			} else {
				dispatch(setError(res.error || 'Failed to update password', 2))
				return
			}
		} catch (error) {
			dispatch(setError('Failed to update password', 2))
		}
	}
	return (
		<div className='min-h-screen bg-gray-100 p-4 md:p-8'>
			<div className='mx-auto max-w-6xl space-y-6'>
				<ProfileHeader profile={user} />

				<div className='rounded-2xl bg-white p-6 shadow-md'>
					<form onSubmit={handleSave} className='space-y-8'>
						{/* Security */}
						{!user.is_login_with_google && (
							<div className={`${isEdittingPassword ? 'border-b pb-10' : ''}`}>
								<div className='flex gap-4'>
									<h3 className='mb-4 text-lg font-semibold text-gray-800'>
										Security
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
												label='Current Password'
												name='currentPassword'
												type={isPasswordVisible ? 'text' : 'password'}
												value={currentPassword}
												onChange={(e) => setCurrentPassword(e.target.value)}
												required={true}
											/>
											<ProfileField
												label='New Password'
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
														{v.message}
													</li>
												))}
											</ul>
											<ProfileField
												label='Confirm Password'
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
													Save
												</button>

												<button
													type='button'
													onClick={handleCancelEditPassword}
													className='rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50'
												>
													Cancel
												</button>
											</div>
										</>
									) : (
										<ProfileField
											label='Password'
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
									disabled={isEdittingPassword}
								/>
							</div>
						</div>

						{/* Personal Details */}
						<div className={`${isEdittingPassword ? 'opacity-20' : ''}`}>
							<h3 className='mb-4 text-lg font-semibold text-gray-800'>
								Personal Details
							</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<ProfileField
									label='First Name'
									name='first_name'
									value={formData.first_name || ''}
									onChange={handleFormChange}
									disabled={isEdittingPassword}
								/>
								<ProfileField
									label='Last Name'
									name='last_name'
									value={formData.last_name || ''}
									onChange={handleFormChange}
									disabled={isEdittingPassword}
								/>
								<ProfileField
									label='Gender'
									name='gender'
									value={formData.gender || ''}
									onChange={handleFormChange}
									disabled={isEdittingPassword}
								/>
								<ProfileField
									label='Date of Birth'
									name='date_of_birth'
									type='date'
									value={formData.date_of_birth || ''}
									onChange={handleFormChange}
									disabled={isEdittingPassword}
								/>
							</div>
						</div>

						<div
							className={`flex flex-wrap gap-4 pt-2 ${isEdittingPassword ? 'opacity-20' : ''}`}
						>
							<button
								type='submit'
								className='rounded-xl bg-[#514587] px-6 py-3 font-semibold text-white transition hover:opacity-90'
								disabled={isEdittingPassword}
							>
								Save Changes
							</button>

							<button
								type='button'
								onClick={handleReset}
								className='rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50'
								disabled={isEdittingPassword}
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
