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
			if (
				window.confirm(
					'Your profile is incomplete or your email is not verified. Complete it now? Cancel will log you out.',
				)
			) {
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

