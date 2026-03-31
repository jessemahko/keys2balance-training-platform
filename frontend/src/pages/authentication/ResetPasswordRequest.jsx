import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import logo from '../../assets/k2b-logo-purple.svg'
import resetPasswordService from '../../services/authen/resetPassword'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'

import './authen.css'

const ResetPasswordRequest = () => {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const { t } = useTranslation()
	const navigate = useNavigate()

	useEffect(() => {
		document.title = t('Forgot Password')
	}, [t])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setMessage('')
		setLoading(true)

		try {
			const res = await resetPasswordService.requestResetPassword(email)
			setMessage(
				res.message ||
					t('If this email exists, a reset link has been sent to your inbox.'),
			)
		} catch (err) {
			setError(err?.response?.data?.error || t('Something went wrong'))
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
					{t('Forgot Password')}
				</h1>
				<p style={{ fontSize: '14.5px', color: '#555', margin: 0 }}>
					{t('Enter your email for a reset link.')}
				</p>

				<form onSubmit={handleSubmit} style={{ width: '100%' }}>
					<div className='input-box' style={{ margin: '20px 0 16px' }}>
						<input
							type='email'
							placeholder={t('Email')}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<i>
							{loading ? (
								<MarkEmailReadIcon fontSize='small' />
							) : (
								<MailOutlineIcon fontSize='small' />
							)}
						</i>
					</div>

					<button
						type='submit'
						className='btn hover:opacity-80!'
						disabled={loading}
					>
						{loading ? t('Sending...') : t('Send Reset Link')}
					</button>
				</form>

				{message && (
					<p style={{ fontSize: '14px', color: '#2f855a', margin: 0 }}>
						{message}
					</p>
				)}
				{error && (
					<p style={{ fontSize: '14px', color: '#e55', margin: 0 }}>{error}</p>
				)}
			</div>
		</div>
	)
}

export default ResetPasswordRequest

