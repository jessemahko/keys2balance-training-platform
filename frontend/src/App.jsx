import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	Routes,
	Route,
	Outlet,
	Navigate,
	useNavigate,
} from 'react-router-dom'
import Authentication from './pages/authentication/Authentication'
import Notification from './components/Notification'
import Dashboard from './pages/dashboard/Dashboard'
import { setUserFn, rmUserFn } from './reducers/userReducer'
import { clearMessages } from './reducers/notiReducer'
import { setToken, isTokenExpired } from './services/authen/login'

import LogoutIcon from '@mui/icons-material/Logout'

const App = () => {
	// using Hooks
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const notification = useSelector((state) => state.noti)
	const navigate = useNavigate()

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)
			if (isTokenExpired(user.token)) {
				dispatch(rmUserFn())
				window.localStorage.removeItem('loggedUser')
			} else {
				dispatch(setUserFn(user))
				setToken(user.token)
			}
		}
		setIsLoading(false)
	}, [dispatch])

	const handleLogout = () => {
		// Logout logic
		window.localStorage.removeItem('loggedUser') // Remove user from localStorage
		dispatch(rmUserFn()) // Dispatch action to remove user from Redux
		navigate('/')
	}

	if (isLoading) return <div>Loading...</div>

	return (
		<div className='min-h-screen bg-slate-100 text-slate-950'>
			{user ? (
				<button
					type='button'
					onClick={handleLogout}
					className='fixed right-5 top-5 z-20 rounded-full bg-white p-3 text-slate-700 shadow-sm transition hover:text-orange-500'
					aria-label='Log out'
				>
					<LogoutIcon />
				</button>
			) : null}

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
					<Route path='/dashboard/*' element={<Dashboard />} />
				</Route>

				<Route path='*' element={<Navigate replace to='/' />} />
			</Routes>
		</div>
	)
}

export default App
