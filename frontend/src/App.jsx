import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom'
import Authentication from './pages/authentication/Authentication'
import AuthSuccess from './pages/authentication/AuthSuccess'
import Notification from './components/Notification'
import Dashboard from './pages/dashboard/Dashboard'
import DiscussionPage from './pages/courses/DiscussionPage'

import { setUserFn, rmUserFn, setUser } from './reducers/userReducer'
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
				dispatch(setUser(user))
				setToken(user.token)
			}
		}
		setIsLoading(false)
	}, [dispatch])

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
		if (loggedUserJSON) {
			const user = JSON.parse(loggedUserJSON)

			dispatch(setUserFn(user))
			setToken(user.token)
		}
		setIsLoading(false)
	}, [])

	if (isLoading) return <div>Loading...</div>

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

				{/* Protected Routes */}
				<Route
					element={
						user ? <Outlet /> : <Navigate replace to='/authentication' />
					}
				>
					<Route path='/' element={<Navigate replace to='/dashboard' />} />
					<Route path='/dashboard/*' element={<Dashboard />} />
					<Route
						path='/courses/:courseId/discussion'
						element={<DiscussionPage />}
					/>
				</Route>

				<Route path='*' element={<Navigate replace to='/' />} />
			</Routes>
		</div>
	)
}

export default App
