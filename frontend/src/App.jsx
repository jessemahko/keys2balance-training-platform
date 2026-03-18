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
import { setUserFn, rmUserFn } from './reducers/userReducer'
import { setToken, isTokenExpired } from './services/login'
import { useTranslation } from 'react-i18next'

const App = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const navigate = useNavigate()
	const location = useLocation()
	const { t, i18n } = useTranslation()

	useEffect(() => {
		const loggedUserJSON = window.localStorage.getItem('loggedUser')
		if (!loggedUserJSON) {
			navigate('authentication')
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

	return (
		<div>
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
						path='/dashboard'
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
