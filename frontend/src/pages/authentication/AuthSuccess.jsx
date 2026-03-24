import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUserFn } from '../../reducers/userReducer'
import { setToken } from '../../services/authen/login'
import { setError, setNotification } from '../../reducers/notiReducer'
import { useTranslation } from 'react-i18next'

const AuthSuccess = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { t, i18n } = useTranslation()

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const token = params.get('token')

		if (token) {
			const payload = JSON.parse(atob(token.split('.')[1]))
			const userWithInfo = { token, ...payload }

			// save complete user object in localStorage
			localStorage.setItem('loggedUser', JSON.stringify(userWithInfo))
			setToken(token)

			dispatch(setUserFn(userWithInfo))
			dispatch(setNotification(`${t('Login successfully')}`, 2))

			// redirect to dashboard
			navigate('/dashboard')
		} else {
			// no token → fallback
			dispatch(setError(`${t('Something went wrong')}`, 2))
			navigate('/authentication')
		}
	}, [])

	return <div>{t('Logging you in')}...</div>
}

export default AuthSuccess

