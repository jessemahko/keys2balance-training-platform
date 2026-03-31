import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { rmUserFn } from '../reducers/userReducer'

const ProtectedRoute = () => {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const location = useLocation()
	const user = useSelector((state) => state.user)

	useEffect(() => {
		if (!user) return

		if (
			location.pathname !== '/dashboard/profile' &&
			(!user.first_name || !user.last_name || !user.phone || !user.is_verified)
		) {
			const message = user.is_verified
				? 'Please complete your profile information before accessing other pages. Choosing "Cancel" will log you out.'
				: 'Your account is not verified. Please verify your account or contact support. Choosing "Cancel" will log you out.'
			if (window.confirm(message)) {
				navigate('/dashboard/profile')
			} else {
				dispatch(rmUserFn())
				navigate('/authentication')
			}
		}
	}, [user, navigate, dispatch, location])

	if (!user) return <Navigate replace to='/authentication' />

	return <Outlet />
}

export default ProtectedRoute

