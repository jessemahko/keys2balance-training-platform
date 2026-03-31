import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import logo from '../../assets/k2b-logo-purple.svg'
import resetPasswordService from '../../services/authen/resetPassword'
import { setError, setNotification } from '../../reducers/notiReducer'

import './authen.css'

const ResetPasswordConfirm = () => {
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [token, setToken] = useState('')
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { t } = useTranslation()

	useEffect(() => {
		document.title = t('Create New Password')
		const params = new URLSearchParams(window.location.search)
		setToken(params.get('token') || '')
	}, [t])

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!token) {
			dispatch(setError('Reset token is missing or invalid.', 5))
			return
		}

		if (newPassword !== confirmPassword) {
			dispatch(setError('Passwords do not match.', 5))
			return
		}

		setLoading(true)
		try {
			const res = await resetPasswordService.confirmResetPassword({
				token,
				newPassword,
			})
			dispatch(
				setNotification(
					res.message || 'Password has been reset successfully.',
					5,
				),
			)
			navigate('/authentication')
		} catch (err) {
			dispatch(
				setError(err?.response?.data?.error || 'Something went wrong', 5),
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='authen-body'>
			<div
				style={{
					background: '#fff',
					borderRadius: '30px',
					boxShadow: '0 0 30px rgba(0,0,0,0.2)',
					padding: '48px 56px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '18px',
					minWidth: '380px',
					maxWidth: '440px',
					textAlign: 'center',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				<button
					onClick={() => navigate('/authentication')}
					style={{
						alignSelf: 'flex-start',
						color: '#857bb1',
						fontSize: '14px',
						fontWeight: 500,
						background: 'transparent',
						border: 'none',
						cursor: 'pointer',
						padding: 0,
					}}
					className='hover:underline! hover:text-[#6f66a0]! transition-colors'
				>
					<ArrowBackIosIcon
						style={{ fontSize: '16px', verticalAlign: 'middle' }}
					/>{' '}
					{t('Login')}
				</button>

				<img
					src={logo}
					alt='Keys2Balance'
					style={{ width: '104px', marginBottom: '4px' }}
				/>

				<h1
					style={{
						fontSize: '26px',
						fontWeight: '700',
						color: '#333',
						margin: 0,
					}}
				>
					{t('Create New Password')}
				</h1>
				<p style={{ fontSize: '14.5px', color: '#555', margin: 0 }}>
					{t('Enter your new password below.')}
				</p>

				<form onSubmit={handleSubmit} style={{ width: '100%' }}>
					<div className='input-box' style={{ margin: '20px 0 12px' }}>
						<input
							className='pr-20! self-start!'
							type={isPasswordVisible ? 'text' : 'password'}
							placeholder={t('New Password')}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
						/>
						<i className='bx bxs-lock-alt relative'>
							{isPasswordVisible ? (
								<VisibilityIcon
									className='absolute right-full top-1/2 -translate-y-1/2 cursor-pointer -translate-x-[5px] hover:opacity-70 hover:border rounded-lg'
									onClick={() => setIsPasswordVisible(!isPasswordVisible)}
								/>
							) : (
								<VisibilityOffIcon
									className='absolute right-full top-1/2 -translate-y-1/2 cursor-pointer -translate-x-[5px] hover:opacity-70 hover:border rounded-lg'
									onClick={() => setIsPasswordVisible(!isPasswordVisible)}
								/>
							)}
						</i>
					</div>
					<div className='input-box' style={{ margin: '0 0 16px' }}>
						<input
							className='pr-20! self-start!'
							type={isPasswordVisible ? 'text' : 'password'}
							placeholder={t('Confirm New Password')}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
						<i className='bx bxs-lock-alt'></i>
					</div>

					<button
						type='submit'
						className='btn hover:opacity-80!'
						disabled={loading}
					>
						{loading ? t('Updating...') : t('Reset Password')}
					</button>
				</form>
			</div>
		</div>
	)
}

export default ResetPasswordConfirm

