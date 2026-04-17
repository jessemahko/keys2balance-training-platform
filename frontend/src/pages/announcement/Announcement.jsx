import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setError, setNotification } from '../../reducers/notiReducer'
import {
	markAsReadFn,
	deleteNotificationFn,
	setNotificationsFn,
} from '../../reducers/announceReducer.js'
import DeleteIcon from '@mui/icons-material/Delete'
import DoneIcon from '@mui/icons-material/Done'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import { styles } from '../style.js'

const AnnouncementPage = () => {
	const dispatch = useDispatch()
	const { t } = useTranslation()
	const notifications = useSelector((state) => state.notifications)
	const [sortBy, setSortBy] = useState('newest')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		document.title = t('Announcements')
	}, [])
	useEffect(() => {
		const fetchNotifications = () => {
			setLoading(true)
			dispatch(setNotificationsFn())
			setLoading(false)
		}
		fetchNotifications()
	}, [dispatch])

	const notificationsToDisplay = useMemo(() => {
		const byCreatedAtDesc = (a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

		if (sortBy === 'oldest') {
			return [...notifications].sort(
				(a, b) =>
					new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
			)
		}

		if (sortBy === 'unread') {
			return [...notifications].sort((a, b) => {
				if (a.is_read === b.is_read) {
					return byCreatedAtDesc(a, b)
				}
				return a.is_read ? 1 : -1
			})
		}

		return [...notifications].sort(byCreatedAtDesc)
	}, [notifications, sortBy])

	const handleDelete = (id) => {
		try {
			dispatch(deleteNotificationFn(id))
			dispatch(setNotification('Notification deleted', 1))
		} catch (error) {
			dispatch(setError('Something went wrong', 5))
		}
	}

	const handleMarkAsRead = (id) => {
		try {
			dispatch(markAsReadFn(id))
			dispatch(setNotification('Notification marked as read', 1))
		} catch (error) {
			dispatch(setError('Something went wrong', 5))
		}
	}

	const formatDate = (dateString) => {
		const date = new Date(dateString)
		const now = new Date()
		const diff = now - date
		const days = Math.floor(diff / (1000 * 60 * 60 * 24))

		if (days === 0) {
			return t('Today')
		} else if (days === 1) {
			return t('Yesterday')
		} else if (days < 7) {
			return t('daysAgo', { count: days })
		} else {
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		}
	}

	const unreadCount = notifications.filter((n) => !n.is_read).length

	if (loading) {
		return (
			<div style={styles.loadingContainer}>
				<div style={styles.loadingSpinner}></div>
				<p style={styles.loadingText}>{t('Loading notifications...')}</p>
			</div>
		)
	}

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<div style={styles.headerLeft}>
					<h1 style={styles.title}>{t('Announcements')}</h1>
					<span style={styles.badge}>
						{t('unreadCount', { count: unreadCount })}
					</span>
				</div>

				<div style={styles.sortWrap}>
					<span style={styles.sortLabel}>{t('Sort by')}</span>
					<div style={styles.segmentedControl}>
						{[
							{ value: 'newest', label: t('Newest') },
							{ value: 'oldest', label: t('Oldest') },
							{ value: 'unread', label: t('Unread') },
						].map((option) => (
							<button
								key={option.value}
								type='button'
								onClick={() => setSortBy(option.value)}
								style={{
									...styles.segmentBtn,
									...(sortBy === option.value ? styles.segmentBtnActive : {}),
								}}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{notifications.length === 0 ? (
				<div style={styles.emptyContainer}>
					<NotificationsNoneIcon style={styles.emptyIcon} />
					<p style={styles.emptyText}>{t('No notifications yet')}</p>
					<p style={styles.emptySubtext}>
						{t("You're all caught up! Check back later for updates.")}
					</p>
				</div>
			) : (
				<div style={styles.listContainer}>
					{notificationsToDisplay.map((noti) => (
						<div
							key={noti.notification_id}
							style={{
								...styles.card,
								...(noti.is_read ? styles.cardRead : styles.cardUnread),
							}}
						>
							<div style={styles.cardHeader}>
								<div style={styles.titleRow}>
									{!noti.is_read && <span style={styles.unreadDot}></span>}
									<h3 style={styles.cardTitle}>{noti.title}</h3>
								</div>
								<span style={styles.date}>{formatDate(noti.created_at)}</span>
							</div>

							<p style={styles.cardMessage}>{noti.message}</p>

							<div style={styles.cardFooter}>
								{!noti.is_read && (
									<button
										style={styles.markReadBtn}
										onClick={() => handleMarkAsRead(noti.notification_id)}
									>
										<DoneIcon style={styles.btnIcon} />
										{t('Mark as read')}
									</button>
								)}
								<button
									style={styles.deleteBtn}
									onClick={() => handleDelete(noti.notification_id)}
								>
									<DeleteIcon style={styles.btnIcon} />
									{t('Delete')}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default AnnouncementPage
