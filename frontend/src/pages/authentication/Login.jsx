import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUserFn } from '../../reducers/userReducer'
import { setError, setNotification } from '../../reducers/notiReducer'
import loginService, { setToken } from '../../services/authen/login'

import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { useField } from '../../hooks/hook'

// import './authen.css'

const Login = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { t, i18n } = useTranslation()
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const { remove: rmUsername, ...username } = useField('text')
	const { remove: rmPassword, ...password } = useField('password')

	const handleLogin = async (e) => {
		e.preventDefault()
		try {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			let user
			if (emailRegex.test(username.value)) {
				user = await loginService.login({
					email: username.value,
					password: password.value,
				})
			} else {
				user = await loginService.login({
					username: username.value,
					password: password.value,
				})
			}
			window.localStorage.setItem('loggedUser', JSON.stringify(user))
			setToken(user.token)
			
			// Decode the token immediately to ensure the user state is complete
			const decoded = JSON.parse(atob(user.token.split('.')[1]))
			const userWithInfo = { ...user, ...decoded }
			
			dispatch(setUserFn(userWithInfo))
			dispatch(setNotification(`${t('Login successfully')}`, 2))
			rmUsername()
			rmPassword()
			navigate('/dashboard')
		} catch (error) {
			dispatch(setError(`${t('Wrong Credentials')}`, 2))
		}
	}

	const base_url = 'http://localhost:3001'

	return (
		<div className='form-box login'>
			<form onSubmit={handleLogin}>
				<h1 className='font-bold'>{t('Sign In')}</h1>
				<div className='input-box'>
					<input {...username} placeholder={t('Username or Email')} />
					<i className='bx bxs-user'></i>
				</div>
				<div className='input-box'>
					<input
						className='pr-20! self-start!'
						{...password}
						type={isPasswordVisible ? 'text' : 'password'}
						placeholder={t('Password')}
					/>
					<i className='bx bxs-lock-alt relative'>
						{isPasswordVisible ? (
							<VisibilityIcon
								className='absolute right-full top-1/2 -translate-y-1/2 cursor-pointer -translate-x-[5px] hover:opacity-70 hover:border rounded-lg'
								fontSize='medium'
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
				<div className='forgot-link '>
					<a href='#' className='hover:underline! text-blue-500!'>
						{t('Forgot Password?')}
					</a>
				</div>
				<button className='btn  hover:opacity-80!' type='submit'>
					{t('Sign In')}
				</button>
				<div className='my-3! or-divider relative'>
					<span>or</span>
				</div>

				<a
					href={`${base_url}/auth/google`}
					className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-100 ease-out flex items-center justify-center gap-2 border rounded-lg py-2'
				>
					<span className=' py-4!'>
						<svg width='16' height='16' viewBox='0 0 16 16'>
							<g clipPath='url(#clip0)'>
								<path
									d='M8.00018 3.16667C9.18018 3.16667 10.2368 3.57333 11.0702 4.36667L13.3535 2.08333C11.9668 0.793333 10.1568 0 8.00018 0C4.87352 0 2.17018 1.79333 0.853516 4.40667L3.51352 6.47C4.14352 4.57333 5.91352 3.16667 8.00018 3.16667Z'
									fill='#EA4335'
								/>
								<path
									d='M15.66 8.18335C15.66 7.66002 15.61 7.15335 15.5333 6.66669H8V9.67335H12.3133C12.12 10.66 11.56 11.5 10.72 12.0667L13.2967 14.0667C14.8 12.6734 15.66 10.6134 15.66 8.18335Z'
									fill='#4285F4'
								/>
								<path
									d='M3.51 9.53001C3.35 9.04668 3.25667 8.53334 3.25667 8.00001C3.25667 7.46668 3.34667 6.95334 3.51 6.47001L0.85 4.40668C0.306667 5.48668 0 6.70668 0 8.00001C0 9.29334 0.306667 10.5133 0.853333 11.5933L3.51 9.53001Z'
									fill='#FBBC05'
								/>
								<path
									d='M8.0001 16C10.1601 16 11.9768 15.29 13.2968 14.0633L10.7201 12.0633C10.0034 12.5467 9.0801 12.83 8.0001 12.83C5.91343 12.83 4.14343 11.4233 3.5101 9.52667L0.850098 11.59C2.1701 14.2067 4.87343 16 8.0001 16Z'
									fill='#34A853'
								/>
							</g>
							<defs>
								<clipPath id='clip0'>
									<rect width='16' height='16' />
								</clipPath>
							</defs>
						</svg>
					</span>
					<span className=''>{t('Continue with Google')}</span>
				</a>
			</form>
		</div>
	)
}

export default Login
