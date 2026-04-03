import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Outlet,
	Navigate,
	useNavigate,
	useLocation,
} from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import Authentication from './pages/authentication/Authentication'
import AuthSuccess from './pages/authentication/AuthSuccess'
import ResetPasswordRequest from './pages/authentication/ResetPasswordRequest'
import ResetPasswordConfirm from './pages/authentication/ResetPasswordConfirm'
import Notification from './components/Notification'
import Dashboard from './pages/dashboard/Dashboard'
import EmailVerify from './pages/profile/EmailVerify'

import { useTranslation } from 'react-i18next'

import { setUserFn, rmUserFn, setUser } from './reducers/userReducer'

import { clearMessages } from './reducers/notiReducer'
import {
	setToken,
	isTokenExpired,
	getStoredUser,
} from './services/authen/login'

import LogoutIcon from '@mui/icons-material/Logout'

const App = () => {
	// using Hooks
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const notification = useSelector((state) => state.noti)
	const navigate = useNavigate()
	const location = useLocation()

	const { t, i18n } = useTranslation()

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const user = getStoredUser()
		if (user) {
			if (isTokenExpired(user.token)) {
				dispatch(rmUserFn())
				window.localStorage.removeItem('loggedUser')
			} else {
				dispatch(setUser(user))
				setToken(user.token)
			}
		}
		setIsLoading(false)
	}, [dispatch])

	useEffect(() => {
		const user = getStoredUser()
		if (user) {
			dispatch(setUserFn(user))
			setToken(user.token)
		}
		setIsLoading(false)
	}, [])

	if (isLoading) return <div>{t('Loading...')}</div>

	return (
		<div className='min-h-screen bg-slate-100 text-slate-950'>
			<Notification
				message={notification.error}
				className='error'
				removeMessage={() => dispatch(clearMessages())}
			/>
			<Notification
				message={notification.noti}
				className='notification'
				removeMessage={() => dispatch(clearMessages())}
			/>
			<Routes>
				{/* Public Route */}
				<Route
					path='/authentication'
					element={
						user ? <Navigate replace to='/dashboard' /> : <Authentication />
					}
				/>
				<Route path='/auth-success' element={<AuthSuccess />} />
				<Route
					path='/auth-failed'
					element={<Navigate replace to='/authentication' />}
				/>
				<Route path='/reset-password' element={<ResetPasswordRequest />} />
				<Route
					path='/reset-password/confirm'
					element={<ResetPasswordConfirm />}
				/>

				<Route path='/verify-email' element={<EmailVerify />} />

				{/* Protected Routes */}
				<Route element={<ProtectedRoute />}>
					<Route path='/' element={<Navigate replace to='/dashboard' />} />
					<Route path='/dashboard/*' element={<Dashboard />} />
				</Route>

				<Route path='*' element={<Navigate replace to='/' />} />
			</Routes>
		</div>
	)
}

export default App
