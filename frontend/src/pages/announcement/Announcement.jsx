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

const AnnouncementPage = () => {
	const dispatch = useDispatch()
	const { t } = useTranslation()
	const notifications = useSelector((state) => state.notifications)
	const [sortBy, setSortBy] = useState('newest')
	const [loading, setLoading] = useState(true)

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

const styles = {
	container: {
		minHeight: '100vh',
		backgroundColor: '#f5f5f7',
		padding: '32px',
		fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '12px',
		flexWrap: 'wrap',
		marginBottom: '24px',
		maxWidth: '800px',
		margin: '0 auto 24px auto',
	},
	headerLeft: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
	},
	title: {
		fontSize: '28px',
		fontWeight: '700',
		color: '#4a3f6b',
		margin: 0,
	},
	badge: {
		backgroundColor: '#6b5b95',
		color: '#fff',
		padding: '6px 14px',
		borderRadius: '20px',
		fontSize: '14px',
		fontWeight: '600',
	},
	sortWrap: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		flexWrap: 'wrap',
	},
	sortLabel: {
		fontSize: '14px',
		color: '#6a6580',
		fontWeight: '600',
	},
	segmentedControl: {
		display: 'flex',
		alignItems: 'center',
		backgroundColor: '#ebe8f5',
		padding: '4px',
		borderRadius: '999px',
		gap: '4px',
	},
	segmentBtn: {
		border: 'none',
		backgroundColor: 'transparent',
		color: '#4f4965',
		padding: '7px 12px',
		borderRadius: '999px',
		fontSize: '13px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
	},
	segmentBtnActive: {
		backgroundColor: '#6b5b95',
		color: '#fff',
		boxShadow: '0 2px 8px rgba(75, 57, 128, 0.2)',
	},
	listContainer: {
		maxWidth: '800px',
		margin: '0 auto',
		display: 'flex',
		flexDirection: 'column',
		gap: '16px',
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: '12px',
		padding: '20px',
		boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
		transition: 'all 0.25s ease',
		border: '1px solid #e8e8ed',
	},
	cardUnread: {
		borderLeft: '4px solid #6b5b95',
		backgroundColor: '#faf9ff',
	},
	cardRead: {
		opacity: 0.75,
	},
	cardHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: '12px',
	},
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
	},
	unreadDot: {
		width: '10px',
		height: '10px',
		borderRadius: '50%',
		backgroundColor: '#6b5b95',
		flexShrink: 0,
	},
	cardTitle: {
		fontSize: '18px',
		fontWeight: '600',
		color: '#2d2d3a',
		margin: 0,
	},
	date: {
		fontSize: '13px',
		color: '#8e8e9d',
		fontWeight: '500',
	},
	cardMessage: {
		fontSize: '15px',
		color: '#5c5c6d',
		lineHeight: '1.6',
		margin: '0 0 16px 0',
	},
	cardFooter: {
		display: 'flex',
		gap: '12px',
		justifyContent: 'flex-end',
	},
	markReadBtn: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		backgroundColor: '#6b5b95',
		color: '#fff',
		border: 'none',
		padding: '8px 16px',
		borderRadius: '8px',
		fontSize: '14px',
		fontWeight: '500',
		cursor: 'pointer',
		transition: 'background-color 0.2s ease',
	},
	deleteBtn: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		backgroundColor: 'transparent',
		color: '#dc3545',
		border: '1px solid #dc3545',
		padding: '8px 16px',
		borderRadius: '8px',
		fontSize: '14px',
		fontWeight: '500',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
	},
	btnIcon: {
		fontSize: '18px',
	},
	emptyContainer: {
		textAlign: 'center',
		padding: '60px 20px',
		maxWidth: '400px',
		margin: '40px auto',
	},
	emptyIcon: {
		fontSize: '64px',
		color: '#c5c5d5',
		marginBottom: '16px',
	},
	emptyText: {
		fontSize: '20px',
		fontWeight: '600',
		color: '#4a3f6b',
		margin: '0 0 8px 0',
	},
	emptySubtext: {
		fontSize: '15px',
		color: '#8e8e9d',
		margin: 0,
	},
	loadingContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: '60vh',
	},
	loadingSpinner: {
		width: '40px',
		height: '40px',
		border: '4px solid #e8e8ed',
		borderTop: '4px solid #6b5b95',
		borderRadius: '50%',
		animation: 'spin 1s linear infinite',
	},
	loadingText: {
		marginTop: '16px',
		color: '#6b5b95',
		fontSize: '16px',
	},
}

export default AnnouncementPage
