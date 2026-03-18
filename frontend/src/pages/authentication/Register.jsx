import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { useField } from '../../hooks/hook'

const Register = () => {
	const { t, i18n } = useTranslation()
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const { remove: rmUsername, ...username } = useField('text')
	const { remove: rmEmail, ...email } = useField('email')
	const { remove: rmPassword, ...password } = useField('password')
	const { remove: rmCfPassword, ...cfPassword } = useField('password')

	const handleRegister = (e) => {}

	return (
		<div className='register form-box'>
			<form onSubmit={handleRegister}>
				<h1 className='font-bold translate-y-[10px]!'>{t('Registration')}</h1>
				<div className='input-box'>
					<input {...username} placeholder={t('Username')} required />
					<i className='bx bxs-user'></i>
				</div>
				<div className='input-box'>
					<input placeholder={t('Email')} required {...email} />
					<i className='bx bxs-envelope'></i>
				</div>
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
					{t('Register')}
				</button>
				<p className='font-normal'>{t('or register with social platforms')}</p>
				<div className='social-icons'>
					<a
						href='#'
						className='hover:bg-[#eece1a]! hover:text-white! transition-all duration-500 ease-out'
					>
						<i className='bx bxl-google'></i>
					</a>
					<a
						href='#'
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

