import { setNotificationsFn } from '../reducers/announceReducer.js'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'

const NotificationListener = () => {
	const dispatch = useDispatch()

	useEffect(() => {
		const fetchNotifications = () => {
			dispatch(setNotificationsFn())
		}

		fetchNotifications()
		const interval = setInterval(fetchNotifications, 10000) // Fetch every 10 seconds

		return () => clearInterval(interval)
	}, [dispatch])

	return null
}

export default NotificationListener

