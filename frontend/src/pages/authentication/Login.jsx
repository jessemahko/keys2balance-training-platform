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
			dispatch(setUserFn(user))
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
				<p className='font-normal'>{t('or login with social platforms')}</p>
				<div className='social-icons'>
					<a
						href={`${base_url}/auth/google`}
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-100 ease-out'
					>
						<i className='bx bxl-google'></i>
					</a>
					<a
						href='#'
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-100 ease-out'
					>
						<i className='bx bxl-facebook'></i>
					</a>
					<a
						href='#'
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-100 ease-out'
					>
						<i className='bx bxl-github'></i>
					</a>
					<a
						href='#'
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-100 ease-out'
					>
						<i className='bx bxl-linkedin'></i>
					</a>
				</div>
			</form>
		</div>
	)
}

export default Login
