import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setError, setNotification } from '../../reducers/notiReducer'
import {
	updateNotificationFn,
	deleteNotificationFn,
	setNotificationsFn,
} from '../../reducers/announceReducer.js'
import DeleteIcon from '@mui/icons-material/Delete'
const AnnouncementPage = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const notifications = useSelector((state) => state.notifications)
	const { t, i18n } = useTranslation()

	useEffect(() => {
		dispatch(setNotificationsFn())
	}, [])
	console.log(notifications)
	if (notifications === null) return <p>Loading...</p>
	const handleDelete = (id) => {
		try {
			dispatch(deleteNotificationFn(id))
		} catch (error) {
			dispatch(setError(t('Something went wrong'), 2))
		}
	}
	return (
		<div>
			{notifications.map((noti) => (
				<div key={noti.notification_id}>
					<h3>{noti.title}</h3>
					<p>{noti.message}</p>
					<button onClick={() => handleDelete(noti.notification_id)}>
						<DeleteIcon />
					</button>
					<br />
				</div>
			))}
		</div>
	)
}

export default AnnouncementPage
