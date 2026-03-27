export const LESSON_FILTERS = {
	ready: 'ready',
	draft: 'draft',
}

export const getErrorMessage = (error, fallbackMessage) => {
	return error?.response?.data?.error || fallbackMessage
}

export const sortLessons = (lessons = []) => {
	return [...lessons].sort((a, b) => {
		const left = Number(a.order_index ?? 0)
		const right = Number(b.order_index ?? 0)
		return left - right
	})
}

export const formatDisplayName = (user) => {
	const firstName =
		user?.first_name ||
		user?.firstName ||
		(typeof user?.name === 'string' ? user.name.split(' ')[0] : '')

	if (firstName) return firstName

	const email = user?.email || ''
	if (!email) return 'Learner'

	const rawName = email.split('@')[0]
	const parts = rawName
		.split(/[._-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))

	return parts.join(' ') || 'Learner'
}

export const normalizeSearchValue = (value) => {
	return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export const getLessonContentCount = (lesson) => {
	return Array.isArray(lesson?.content_data) ? lesson.content_data.length : 0
}

export const getLessonStatus = (lesson) => {
	return getLessonContentCount(lesson) > 0 ? LESSON_FILTERS.ready : LESSON_FILTERS.draft
}
