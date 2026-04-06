import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../../reducers/userReducer'
import { setToken } from '../../services/authen/login'
import { setError, setNotification } from '../../reducers/notiReducer'
import { useTranslation } from 'react-i18next'

const decodeJWT = (token) => {
	const base64 = token.split('.')[1]
	const base64Url = base64.replace(/-/g, '+').replace(/_/g, '/')
	const jsonPayload = decodeURIComponent(
		atob(base64Url)
			.split('')
			.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
			.join(''),
	)

	return JSON.parse(jsonPayload)
}

const AuthSuccess = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { t, i18n } = useTranslation()

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const token = params.get('token')

		if (token) {
			const payload = decodeJWT(token)
			console.log(payload)

			const userWithInfo = { token, ...payload }

			// save complete user object in localStorage
			localStorage.setItem('loggedUser', JSON.stringify(userWithInfo))
			setToken(token)

			dispatch(setUser(userWithInfo))
			dispatch(setNotification('Login successfully', 5))

			// redirect to dashboard
			navigate('/dashboard')
		} else {
			// no token → fallback
			dispatch(setError('Something went wrong', 5))
			navigate('/authentication')
		}
	}, [])

	return <div>{t('Logging you in')}...</div>
}

export default AuthSuccess
