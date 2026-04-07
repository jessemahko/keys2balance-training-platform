const Courses = require('../../models/courses')

const getCourses = async (req, res) => {
	if (req.user.role === 'admin') {
		const courses = await Courses.findAll()
		return res.json(courses)
	}

	if (req.user.role === 'participant') {
		const courses = await Courses.findAllByParticipantId(req.user.id)
		return res.json(courses)
	}

	const teacherId = req.user.id
	const courses = await Courses.findAllByTeacherId(teacherId)
	res.json(courses)
}

const getCourse = async (req, res) => {
	const id = req.params.id
	if (!id) {
		return res.status(400).json({ error: 'course id is required' })
	}

	const course = await Courses.findById(req.params.id)

	if (!course) {
		return res.status(404).json({ error: 'course not found' })
	}

	if (req.user.role === 'participant') {
		const enrollment = await Courses.findEnrollment(req.user.id, course.course_id)
		if (!enrollment) {
			return res
				.status(403)
				.json({ error: 'Only enrolled participants can view this course' })
		}
		return res.json(course)
	}

	if (
		req.user.role !== 'admin' &&
		String(course.teacher_id) !== String(req.user.id)
	) {
		return res
			.status(403)
			.json({ error: 'Only the course creator can view this course' })
	}

	res.json(course)
}

const createCourse = async (req, res) => {
	if (req.user.role !== 'admin' && req.user.role !== 'trainer') {
		return res.status(403).json({ error: 'Only admins and trainers can create courses' })
	}

	const { title, description, thumbnailUrl, teacherId } = req.body
	const trimmedTitle = typeof title === 'string' ? title.trim() : ''
	if (!trimmedTitle) {
		return res.status(400).json({ error: 'title is required' })
	}

	// trainers can only create courses for themselves.
	// Only admins can assign a teacherId to another user.
	let finalTeacherId = teacherId
	if (req.user.role !== 'admin') {
		finalTeacherId = req.user.id
	} else if (!teacherId) {
		// Admin must provide a teacherId if they want to assign it, 
		// otherwise default to themselves if they are also a trainer.
		finalTeacherId = req.user.id
	}

	const course = await Courses.createCourse({
		title: trimmedTitle,
		description,
		thumbnailUrl,
		teacherId: finalTeacherId,
	})

	res.status(201).json(course)
}

const updateCourse = async (req, res) => {
	const courseId = req.params.id
	if (!courseId) {
		return res.status(400).json({ error: 'course id is required' })
	}

	const existingCourse = await Courses.findById(courseId)

	if (!existingCourse) {
		return res.status(404).json({ error: 'course not found' })
	}

	if (
		req.user.role !== 'admin' &&
		String(existingCourse.teacher_id) !== String(req.user.id)
	) {
		return res
			.status(403)
			.json({ error: 'Only the course creator can modify this course' })
	}

	const { title, description, thumbnailUrl, teacherId } = req.body

	const trimmedTitle = typeof title === 'string' ? title.trim() : ''
	if (!trimmedTitle) {
		return res.status(400).json({ error: 'title cannot be empty' })
	}
	const updates = { title: trimmedTitle, description, thumbnailUrl }
	if (teacherId && req.user.role === 'admin') updates.teacherId = teacherId

	const course = await Courses.updateCourse(courseId, updates)

	res.json(course)
}

const deleteCourse = async (req, res) => {
	const courseId = req.params.id
	if (!courseId) {
		return res.status(400).json({ error: 'course id is required' })
	}

	const existingCourse = await Courses.findById(courseId)
	if (!existingCourse) {
		return res.status(404).json({ error: 'course not found' })
	}

	if (
		req.user.role !== 'admin' &&
		String(existingCourse.teacher_id) !== String(req.user.id)
	) {
		return res.status(403).json({ error: 'Only admins or the course creator can delete courses' })
	}

	const deletedCourse = await Courses.deleteCourse(courseId)
	if (!deletedCourse) return res.status(404).json({ error: 'course not found' })

	res.status(204).end()
}

const enrollStudent = async (req, res) => {
	const courseId = req.params.id
	const { userId } = req.body

	if (!courseId || !userId) {
		return res.status(400).json({ error: 'course id and user id are required' })
	}

	const course = await Courses.findById(courseId)
	if (!course) {
		return res.status(404).json({ error: 'course not found' })
	}

	if (req.user.role !== 'admin' && String(course.teacher_id) !== String(req.user.id)) {
		return res.status(403).json({ error: 'Only the course creator can enroll participants' })
	}

	const enrollment = await Courses.enrollInCourse(userId, courseId)
	res.status(201).json(enrollment)
}

const removeStudent = async (req, res) => {
	const courseId = req.params.id
	const userId = req.params.userId

	if (!courseId || !userId) {
		return res.status(400).json({ error: 'course id and user id are required' })
	}

	const course = await Courses.findById(courseId)
	if (!course) {
		return res.status(404).json({ error: 'course not found' })
	}

	if (req.user.role !== 'admin' && String(course.teacher_id) !== String(req.user.id)) {
		return res.status(403).json({ error: 'Only the course creator can remove participants' })
	}

	await Courses.deleteEnrollment(userId, courseId)
	res.status(204).end()
}

module.exports = {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	enrollStudent,
	removeStudent,
}
