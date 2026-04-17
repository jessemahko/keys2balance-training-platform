const { pool } = require('../utils/config')

const getAll = async () => {
	const query = `
            SELECT *
            FROM notifications
            ORDER BY created_at DESC
        `
	const { rows } = await pool.query(query)
	return rows
}
const getById = async (notificationId) => {
	const query = `
            SELECT *
            FROM notifications
            WHERE notification_id = $1
        `
	const { rows } = await pool.query(query, [notificationId])
	return rows[0]
}
const getByUser = async (userId) => {
	const query = `
            SELECT *
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
        `
	const { rows } = await pool.query(query, [userId])
	return rows
}
const create = async ({ userId, type, title, message }) => {
	const query = `
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `
	const { rows } = await pool.query(query, [userId, type, title, message])
	return rows[0]
}
const markAsRead = async (userId) => {
	const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = $1 AND is_read = FALSE
            RETURNING *
        `
	const { rows } = await pool.query(query, [userId])
	return rows || []
}
const markAsReadById = async (notificationId) => {
	const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = $1
            RETURNING *
        `
	const { rows } = await pool.query(query, [notificationId])
	return rows[0]
}
const deleteNotification = async (notificationId) => {
	const query = `
            DELETE FROM notifications
            WHERE notification_id = $1
            RETURNING *
        `
	const { rows } = await pool.query(query, [notificationId])
	return rows[0]
}

const insertNotifications = async (notifications) => {
	if (!notifications.length) return

	const values = []
	const placeholders = notifications
		.map((n, i) => {
			const base = i * 4
			values.push(n.user_id, n.type, n.title, n.message)
			return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
		})
		.join(',')

	await pool.query(
		`INSERT INTO notifications (user_id, type, title, message)
		VALUES ${placeholders}`,
		values,
	)
}

const createCourseDeletedNotifications = async (courseId, courseTitle) => {
	const usersQuery = `
		SELECT user_id
		FROM course_enrollments
		WHERE course_id = $1
	`
	const usersResult = await pool.query(usersQuery, [courseId])

	const recipients = new Set(usersResult.rows.map((u) => u.user_id))

	if (!recipients.size) return

	const notifications = [...recipients].map((user_id) => ({
		user_id,
		type: 'course_deleted',
		title: 'Course deleted',
		message: `Course "${courseTitle}" has been deleted`,
	}))

	await insertNotifications(notifications)
}
const createEnrollmentNotifications = async (courseId, userId, courseTitle) => {
	const notification = {
		user_id: userId,
		type: 'course_enrolled',
		title: 'New Enrollment',
		message: `You enrolled in "${courseTitle}"`,
	}

	await insertNotifications([notification])
}

const createEnrollmentRemovedNotifications = async (
	courseId,
	userId,
	courseTitle,
) => {
	const notification = {
		user_id: userId,
		type: 'course_removed',
		title: 'Enrollment Removed',
		message: `You were removed from "${courseTitle}"`,
	}

	await insertNotifications([notification])
}

const createCourseAssignedNotification = async (
	courseId,
	userId,
	courseTitle,
) => {
	const notification = {
		user_id: userId,
		type: 'course_assigned',
		title: 'Course assigned',
		message: `You were assigned to be the instructor of the course "${courseTitle}"`,
	}

	await insertNotifications([notification])
}

const createThreadCreatedNotifications = async (
	courseId,
	threadCreatorId,
	threadTitle,
	teacherId,
	courseTitle,
) => {
	const usersResult = await pool.query(
		`SELECT user_id
		FROM course_enrollments
		WHERE course_id = $1`,
		[courseId],
	)

	const userIds = usersResult.rows.map((u) => u.user_id)

	const recipients = new Set(userIds)

	recipients.add(teacherId)
	recipients.delete(threadCreatorId)

	const notifications = [...recipients].map((user_id) => ({
		user_id,
		type: 'thread_created',
		title: 'New thread created',
		message: `New thread "${threadTitle}" was created in the course "${courseTitle}"`,
	}))

	await insertNotifications(notifications)
}

const createNewLessonNotifications = async (
	courseId,
	lessonTitle,
	creatorId,
	teacherId,
	courseTitle,
) => {
	const usersResult = await pool.query(
		`SELECT user_id
		FROM course_enrollments
		WHERE course_id = $1`,
		[courseId],
	)

	const recipients = new Set(usersResult.rows.map((u) => u.user_id))

	recipients.add(teacherId)
	recipients.delete(creatorId)

	if (!recipients.size) return

	const notifications = [...recipients].map((user_id) => ({
		user_id,
		type: 'new_lesson_available',
		title: 'New lesson added',
		message: `New lesson "${lessonTitle}" was added in course "${courseTitle}"`,
	}))

	await insertNotifications(notifications)
}

const createNewAssessmentNotifications = async (
	courseId,
	assessmentTitle,
	creatorId,
	courseTitle,
	teacherId,
) => {
	const usersResult = await pool.query(
		`SELECT user_id
		FROM course_enrollments
		WHERE course_id = $1`,
		[courseId],
	)

	const recipients = new Set(usersResult.rows.map((u) => u.user_id))

	recipients.add(teacherId)
	recipients.delete(creatorId)

	if (!recipients.size) return

	const notifications = [...recipients].map((user_id) => ({
		user_id,
		type: 'new_quiz_available',
		title: 'New quiz available',
		message: `New quiz "${assessmentTitle}" was added in the course "${courseTitle}"`,
	}))

	await insertNotifications(notifications)
}

const createAssessmentUpdatedNotifications = async (
	courseId,
	assessmentTitle,
	creatorId,
	courseTitle,
	teacherId,
) => {
	const usersResult = await pool.query(
		`SELECT user_id
		FROM course_enrollments
		WHERE course_id = $1`,
		[courseId],
	)

	const recipients = new Set(usersResult.rows.map((u) => u.user_id))

	recipients.add(teacherId)
	recipients.delete(creatorId)

	if (!recipients.size) return

	const notifications = [...recipients].map((user_id) => ({
		user_id,
		type: 'quiz_updated',
		title: 'Quiz updated',
		message: `Quiz "${assessmentTitle}" was updated in the course "${courseTitle}"`,
	}))

	await insertNotifications(notifications)
}

const createAssessmentDeletedNotifications = async (
	courseId,
	assessmentTitle,
	creatorId,
	courseTitle,
	teacherId,
) => {
	const usersResult = await pool.query(
		`SELECT user_id
		FROM course_enrollments
		WHERE course_id = $1`,
		[courseId],
	)

	const recipients = new Set(usersResult.rows.map((u) => u.user_id))

	recipients.add(teacherId)
	recipients.delete(creatorId)

	if (!recipients.size) return

	const notifications = [...recipients].map((user_id) => ({
		user_id,
		type: 'quiz_deleted',
		title: 'Quiz deleted',
		message: `Quiz "${assessmentTitle}" was deleted in the course "${courseTitle}"`,
	}))

	await insertNotifications(notifications)
}

const createQuizGradedNotification = async (
	assessmentTitle,
	courseTitle,
	userId,
) => {
	const notification = {
		user_id: userId,
		type: 'quiz_graded',
		title: 'Quiz graded',
		message: `Your quiz "${assessmentTitle}" in course "${courseTitle}" was graded`,
	}

	await insertNotifications([notification])
}

const createRoleAssignedNotification = async (userId, role) => {
	const notification = {
		user_id: userId,
		type: role === 'trainer' ? 'trainer_assigned' : 'participant_assigned',
		title: 'Role assigned',
		message: `You have been assigned as ${role}`,
	}

	await insertNotifications([notification])
}

const createQuizSubmittedNotification = async (
	teacherId,
	assessmentTitle,
	lessonTitle,
	courseTitle,
) => {
	const notification = {
		user_id: teacherId,
		type: 'quiz_submitted',
		title: 'Quiz submitted',
		message: `The quiz "${assessmentTitle}" in lesson "${lessonTitle}" of course "${courseTitle}" has a new submission`,
	}

	await insertNotifications([notification])
}

module.exports = {
	getAll,
	getById,
	getByUser,
	create,
	markAsRead,
	markAsReadById,
	deleteNotification,
	createCourseDeletedNotifications,
	createQuizGradedNotification,
	createNewAssessmentNotifications,
	createNewLessonNotifications,
	createAssessmentUpdatedNotifications,
	createAssessmentDeletedNotifications,
	createThreadCreatedNotifications,
	createEnrollmentNotifications,
	createEnrollmentRemovedNotifications,
	createCourseAssignedNotification,
	createRoleAssignedNotification,
	createQuizSubmittedNotification,
}
