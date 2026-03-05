const Courses = require('../../models/courses')

const getCourses = async (req, res) => {
	const courses = await Courses.findAll()
	res.json(courses)
}

const getCourse = async (req, res) => {
	const course = await Courses.findById(req.params.id)

	if (!course) {
		return res.status(404).json({ error: 'course not found' })
	}

	res.json(course)
}

const createCourse = async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Authentication required' })
	}

	const { title, description, thumbnailUrl } = req.body
	const trimmedTitle = typeof title === 'string' ? title.trim() : ''
	const teacherId = req.user.id

	if (!trimmedTitle) {
		return res.status(400).json({ error: 'title is required' })
	}

	const course = await Courses.createCourse({
		title: trimmedTitle,
		description,
		thumbnailUrl,
		teacherId,
	})

	res.status(201).json(course)
}

const updateCourse = async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Authentication required' })
	}

	const existingCourse = await Courses.findById(req.params.id)

	if (!existingCourse) {
		return res.status(404).json({ error: 'course not found' })
	}

	if (String(existingCourse.teacher_id) !== String(req.user.id)) {
		return res
			.status(403)
			.json({ error: 'Only the course creator can modify this course' })
	}

	const { title, description, thumbnailUrl, teacherId } = req.body
	const updates = {}

	if (title !== undefined) {
		const trimmedTitle = typeof title === 'string' ? title.trim() : ''
		if (!trimmedTitle) {
			return res.status(400).json({ error: 'title cannot be empty' })
		}
		updates.title = trimmedTitle
	}

	if (description !== undefined) {
		updates.description = description
	}

	if (thumbnailUrl !== undefined) {
		updates.thumbnailUrl = thumbnailUrl
	}

	if (teacherId !== undefined) {
		updates.teacherId = teacherId
	}

	if (Object.keys(updates).length === 0) {
		return res.status(400).json({ error: 'no valid fields to update' })
	}

	const course = await Courses.updateCourse(req.params.id, updates)

	res.json(course)
}

const deleteCourse = async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Authentication required' })
	}

	const course = await Courses.findById(req.params.id)

	if (!course) {
		return res.status(404).json({ error: 'course not found' })
	}

	if (String(course.teacher_id) !== String(req.user.id)) {
		return res
			.status(403)
			.json({ error: 'Only the course creator can modify this course' })
	}

	const deletedCourse = await Courses.deleteCourse(req.params.id)
	if (!deletedCourse) return res.status(404).json({ error: 'course not found' })

	res.status(204).end()
}

module.exports = {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
}
