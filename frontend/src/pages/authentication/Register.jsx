import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import registerService from '../../services/authen/register'

import { setNotification, setError } from '../../reducers/notiReducer'
import { useField } from '../../hooks/hook'

const Register = ({ setActive }) => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch()

	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const { remove: rmUsername, ...username } = useField('text')
	const { remove: rmPassword, ...password } = useField('password')
	const { remove: rmCfPassword, ...cfPassword } = useField('password')

	const validate = () => {
		const rules = [
			{
				condition: username.value.length < 5,
				message: t('Username must be at least 5 characters'),
			},
			{
				condition: password.value !== cfPassword.value,
				message: t('Password does not match'),
			},
			{
				condition: password.value.length < 8,
				message: t('Password must be at least 8 characters'),
			},
			{
				condition: !/\d/.test(password.value),
				message: t('Password must contain at least one number'),
			},
			{
				condition: !/[A-Z]/.test(password.value),
				message: t('Password must contain a capital letter'),
			},
			{
				condition: !/[!@#$%^&*(),.?":{}|<>]/.test(password.value),
				message: t('Password must contain at least one special character'),
			},
			{
				condition: /\s/.test(password.value),
				message: t('Password must not contain whitespace'),
			},
		]

		for (const rule of rules) {
			if (rule.condition) {
				dispatch(setError(rule.message, 2))
				return false
			}
		}

		return true
	}

	const handleRegister = async (e) => {
		e.preventDefault()
		try {
			if (!validate()) return

			const user = await registerService.register({
				username: username.value,
				password: password.value,
			})

			dispatch(setNotification(`${t('Register successfully')}`, 2))
			rmUsername()
			rmPassword()
			rmCfPassword()
			setActive(false)
		} catch (err) {
			if (err.response.data.error) {
				dispatch(setError(err.response.data.error, 2))
				return
			}

			dispatch(setError(`${t('Something went wrong')}`, 2))
		}
	}

	const base_url = 'http://localhost:3001'
	return (
		<div className='register form-box'>
			<form onSubmit={handleRegister}>
				<h1 className='font-bold translate-y-[10px]!'>{t('Registration')}</h1>

				{/* Username */}
				<div className='input-box'>
					<input {...username} placeholder={t('Username')} required />
					<i className='bx bxs-user'></i>
				</div>

				{/* Password */}
				<div className='input-box'>
					<input
						className='pr-20! self-start!'
						{...password}
						type={isPasswordVisible ? 'text' : 'password'}
						placeholder={t('Password')}
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

				{/* Confirm Password */}
				<div className='input-box'>
					<input
						className='pr-20! self-start!'
						{...cfPassword}
						type={isPasswordVisible ? 'text' : 'password'}
						placeholder={t('Re-type password')}
						required
					/>
					<i className='bx bxs-lock-alt'></i>
				</div>
				<button type='submit' className='btn hover:opacity-80!'>
					{t('Sign Up')}
				</button>
				<p className='font-normal'>{t('or register with social platforms')}</p>
				<div className='social-icons'>
					<a
						href={`${base_url}/auth/google`}
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-500 ease-out'
					>
						<i className='bx bxl-google'></i>
					</a>
					<a
						href={`${base_url}/auth/facebook`}
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-500 ease-out'
					>
						<i className='bx bxl-facebook'></i>
					</a>
					<a
						href='#'
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-500 ease-out'
					>
						<i className='bx bxl-github'></i>
					</a>
					<a
						href='#'
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-500 ease-out'
					>
						<i className='bx bxl-linkedin'></i>
					</a>
				</div>
			</form>
		</div>
	)
}

export default Register
