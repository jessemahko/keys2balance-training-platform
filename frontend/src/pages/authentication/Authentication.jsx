import { useState, useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import Login from './Login'
import Register from './Register'

import './authen.css'

const Authentication = () => {
	const [active, setActive] = useState(location.state?.active || false)
	const { t, i18n } = useTranslation()

	useEffect(() => {
		document.title = active ? 'Register' : 'Login'
	}, [active])

	return (
		<div className='authen-body relative'>
			<div className={`authen-container ${active ? 'active' : ''}`}>
				<Login />
				<Register setActive={setActive} />
				{/* Toggle box */}
				<div className='toggle-box'>
					<div className='toggle-panel toggle-left'>
						<h1 className='font-bold'>{t('Welcome Back!')}</h1>
						<p>{t("Don't have an account?")}</p>
						<button
							className='btn register-btn hover:opacity-80!'
							onClick={() => {
								setActive(true)
							}}
						>
							{t('Sign Up')}
						</button>
					</div>

					<div className='toggle-panel toggle-right'>
						<h1 className='font-bold'>{t('Hello, Friend!')}</h1>
						<p className='font-normal'>{t('Already have an account?')}</p>
						<button
							className='btn login-btn hover:opacity-80!'
							onClick={() => {
								setActive(false)
							}}
						>
							{t('Sign In')}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Authentication
