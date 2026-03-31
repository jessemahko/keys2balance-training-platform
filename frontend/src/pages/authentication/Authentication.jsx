import { useState, useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import Login from './Login'
import Register from './Register'
import whiteLogo from '../../assets/k2b-logo-white.svg'

import './authen.css'

const Authentication = () => {
	const [active, setActive] = useState(location.state?.active || false)
	const { t, i18n } = useTranslation()

	useEffect(() => {
		document.title = active ? t('Register') : t('Login')
	}, [active, t])

	return (
		<div className='authen-body relative'>
			<div className={`authen-container ${active ? 'active' : ''}`}>
				<Login />
				<Register setActive={setActive} />
				{/* Toggle box */}
				<div className='toggle-box'>
					<div className='toggle-panel toggle-left'>
						<div className='flex items-center gap-4 mb-1'>
							<img
								src={whiteLogo}
								alt='Keys2Balance logo'
								className='w-11 sm:w-14 h-auto brightness-200 contrast-200 saturate-0 drop-shadow-[0_0_0px_rgba(255,255,255,0.95)]'
							/>
							<h1 className='font-normal text-xl sm:text-2xl leading-none'>
								Keys2Balance
							</h1>
						</div>
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
						<div className='flex items-center gap-4 mb-1'>
							<img
								src={whiteLogo}
								alt='Keys2Balance logo'
								className='w-11 sm:w-14 h-auto brightness-200 contrast-200 saturate-0 drop-shadow-[0_0_0px_rgba(255,255,255,0.95)]'
							/>
							<h1 className='font-normal text-xl sm:text-2xl leading-none'>
								Keys2Balance
							</h1>
						</div>
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
