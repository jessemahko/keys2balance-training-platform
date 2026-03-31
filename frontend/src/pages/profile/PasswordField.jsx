import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { useTranslation } from 'react-i18next'

import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DangerousIcon from '@mui/icons-material/Dangerous'
import { changePassword } from '../../services/profile'

import { setNotification, setError } from '../../reducers/notiReducer'
import { getToken, isTokenExpired } from '../../services/authen/login'
import { rmUserFn } from '../../reducers/userReducer'
import ProfileField from '../../components/profile/ProfileField'

const PasswordField = ({ isEdittingPassword, setIsEdittingPassword }) => {
	const user = useSelector((state) => state.user)

	const dispatch = useDispatch()
	const { t } = useTranslation()
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const [isAllowSave, setIsAllowSave] = useState(false)

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

	const handleCancelEditPassword = () => {
		setCurrentPassword('')
		setNewPassword('')
		setConfirmPassword('')
		setIsEdittingPassword(false)
		setIsPasswordVisible(false)
	}

	return (
		<>
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
								onClick={(e) => {
									setIsEdittingPassword(true)
									setTimeout(() => {
										const input = document.querySelector(
											`input[name="currentPassword"]`,
										)
										if (input) {
											input.focus()
										}
									}, 0)
								}}
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
		</>
	)
}

export default PasswordField

