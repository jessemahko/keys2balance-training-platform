import { useState, useEffect, cloneElement } from 'react'
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
import Authentication from './pages/authentication/Authentication'
import Notification from './components/Notification'
import { setUserFn, rmUserFn } from './reducers/userReducer'
import { clearMessages } from './reducers/notiReducer'
import { setToken, isTokenExpired } from './services/login'
import { useTranslation } from 'react-i18next'

import LogoutIcon from '@mui/icons-material/Logout'

const App = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const notification = useSelector((state) => state.noti)
	const navigate = useNavigate()
	const location = useLocation()
	const { t, i18n } = useTranslation()

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
		if (!loggedUserJSON) {
			navigate('/authentication')
			return
		}

		const user = JSON.parse(loggedUserJSON)
		if (isTokenExpired(user.token)) {
			dispatch(rmUserFn())
			window.localStorage.removeItem('loggedUser')
		} else {
			dispatch(setUserFn(user))
			setToken(user.token)
		}
	}, [])

	const handleLogout = () => {
		// Logout logic
		window.localStorage.removeItem('loggedPrjMnUser') // Remove user from localStorage
		dispatch(rmUserFn()) // Dispatch action to remove user from Redux
		navigate('/')
	}

	return (
		<div>
			{/* Log out button for testing */}
			<div onClick={handleLogout} className='relative hover:text-orange-500'>
				<LogoutIcon />
			</div>

			{/* Display notifications */}
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
				<Route path='/authentication' element={<Authentication />} />

				{/* Protected Routes */}
				<Route
					element={
						user ? <Outlet /> : <Navigate replace to='/authentication' />
					}
				>
					<Route path='/' element={<Navigate replace to='/dashboard' />} />
					<Route
						path='/dashboard/*'
						element={<div>{/* dashboard element */}</div>}
					/>
				</Route>

				{/* Catch-all Route */}
				<Route path='*' element={<Navigate replace to='/' />} />
			</Routes>
		</div>
	)
}

export default App
