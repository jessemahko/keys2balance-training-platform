const Discussion = require('../../models/discussion')
const Course = require('../../models/courses')

const getThreads = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const courseId = req.query.courseId || req.body.courseId
	if (!courseId) {
		return res.status(400).json({ error: 'courseId is required' })
	}

	const enrollment = await Course.findEnrollment(user.id, courseId)
	
	if (!enrollment) {
		const course = await Course.findById(courseId)
		const isTeacher = course && String(course.teacher_id) === String(user.id)
		const isAdmin = user.role === 'admin'
		
		if (!isTeacher && !isAdmin) {
			return res
				.status(403)
				.json({ error: 'Forbidden: Not enrolled or authorized for this course' })
		}
	}

	const threads = await Discussion.getThreadsByCourse(courseId)
	res.json(threads)
}

const createThread = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { courseId } = req.body
	if (!courseId) {
		return res.status(400).json({ error: 'courseId is required' })
	}

	// For debugging enrollment issues
	console.log('Creating thread for user:', user.id, 'course:', courseId)

	const enrollment = await Course.findEnrollment(user.id, courseId)
	
	// If the user is an admin or the teacher of the course, they might not be in the course_enrollments table
	// but should still be allowed to create threads.
	if (!enrollment) {
		const course = await Course.findById(courseId)
		const isTeacher = course && String(course.teacher_id) === String(user.id)
		const isAdmin = user.role === 'admin'
		
		if (!isTeacher && !isAdmin) {
			return res
				.status(403)
				.json({ error: 'Forbidden: Not enrolled or authorized for this course' })
		}
	}

	const { title } = req.body
	const trimmedTitle = typeof title === 'string' ? title.trim() : ''

	if (!trimmedTitle) {
		return res.status(400).json({ error: 'title is required' })
	}

	const newThread = await Discussion.createThread(courseId, trimmedTitle)
	res.status(201).json(newThread)
}

const createMessage = async (req, res) => {
	const { message } = req.body
	const trimmedMessage = typeof message === 'string' ? message.trim() : ''

	if (!trimmedMessage) {
		return res.status(400).json({ error: 'message text is required' })
	}

	const user = req.user
	const { id } = req.params
	if (!id) {
		return res.status(400).json({ error: 'thread id is required' })
	}

	const thread = await Discussion.findThreadById(id)
	if (!thread) {
		return res.status(404).json({ error: 'Thread not found' })
	}

	const enrollment = await Course.findEnrollment(user.id, thread.course_id)
	
	if (!enrollment) {
		const course = await Course.findById(thread.course_id)
		const isTeacher = course && String(course.teacher_id) === String(user.id)
		const isAdmin = user.role === 'admin'
		
		if (!isTeacher && !isAdmin) {
			return res
				.status(403)
				.json({ error: 'Forbidden: Not enrolled or authorized for this course' })
		}
	}

	// FIXED: Using req.user.id exactly how it's formatted in the login token
	const newMessage = await Discussion.createMessage(
		id,
		req.user.id,
		trimmedMessage,
	)
	res.status(201).json(newMessage)
}

module.exports = {
	getThreads,
	createThread,
	createMessage,
}
