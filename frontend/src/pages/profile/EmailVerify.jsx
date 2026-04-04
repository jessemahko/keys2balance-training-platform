import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/k2b-logo-purple.svg'
import profileService from '../../services/profile'
import { editUser } from '../../reducers/userReducer'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import '../authentication/authen.css'

const EmailVerify = () => {
	const dispatch = useDispatch()
	const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
	const [message, setMessage] = useState('')
	const navigate = useNavigate()
	const { t } = useTranslation()

	useEffect(() => {
		document.title = t('Email Verification')
	}, [t])

	useEffect(() => {
		const verify = async () => {
			const params = new URLSearchParams(window.location.search)
			const token = params.get('token')

			if (!token) {
				setStatus('error')
				setMessage(t('No verification token found.'))
				return
			}

			try {
				const res = await profileService.VerifyEmail(token)
				setStatus('success')
				setMessage(res.message || t('Your account has been verified!'))
				// Update the user's profile to reflect the verified status
				await dispatch(editUser({ is_verified: true }))
			} catch (err) {
				setStatus('error')
				setMessage(
					err?.response?.data?.error ||
						t('Verification failed. The link may have expired.'),
				)
			}
		}

		verify()
	}, [])

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
					gap: '20px',
					minWidth: '380px',
					maxWidth: '440px',
					textAlign: 'center',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				<img
					src={logo}
					alt='Keys2Balance'
					style={{ width: '120px', marginBottom: '8px' }}
				/>

				{status === 'verifying' && (
					<p style={{ fontSize: '15px', color: '#555' }}>
						{t('Verifying your email…')}
					</p>
				)}

				{status === 'success' && (
					<>
						<h1
							style={{
								fontSize: '26px',
								fontWeight: '700',
								color: '#333',
								margin: 0,
							}}
						>
							{t('Email Verified!')}
						</h1>
						<p style={{ fontSize: '14.5px', color: '#555', margin: 0 }}>
							{message}
						</p>
						<button
							className='btn hover:opacity-80!'
							style={{ marginTop: '8px' }}
							onClick={() => navigate('/dashboard')}
						>
							{t('Continue to Dashboard')}
						</button>
					</>
				)}

				{status === 'error' && (
					<>
						<h1
							style={{
								fontSize: '26px',
								fontWeight: '700',
								color: '#333',
								margin: 0,
							}}
						>
							{t('Verification Failed')}
						</h1>
						<p style={{ fontSize: '14.5px', color: '#e55', margin: 0 }}>
							{message}
						</p>
						<button
							className='btn hover:opacity-80!'
							style={{ marginTop: '8px' }}
							onClick={() => navigate('/authentication')}
						>
							{t('Back to Login')}
						</button>
					</>
				)}
			</div>
		</div>
	)
}

export default EmailVerify
