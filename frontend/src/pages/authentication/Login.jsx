import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUserFn } from '../../reducers/userReducer'
import { setError, setNotification } from '../../reducers/notiReducer'
import loginService, { setToken } from '../../services/login'

import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { useField } from '../../hooks/hook'

import './authen.css'

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
			const user = await loginService.login({
				username: username.value,
				password: password.value,
			})
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

	return (
		<div className='form-box login'>
			<form onSubmit={handleLogin}>
				<h1 className='font-bold'>{t('Login')}</h1>
				<div className='input-box'>
					<input {...username} placeholder={t('Username')} />
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
					<a href='#' className='hover:text-blue-500!'>
						{t('Forgot Password?')}
					</a>
				</div>
				<button className='btn  hover:opacity-80!' type='submit'>
					{t('Login')}
				</button>
			</form>
		</div>
	)
}

export default Login

