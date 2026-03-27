const Lesson = require('../../models/lesson')
const Course = require('../../models/courses')
const crypto = require('crypto')

/**
 * LESSON CONTROLLER
 * Manages individual pages and dynamic content blocks within a Course.
 */

const getLesson = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const lesson = await Lesson.findById(req.params.id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	// Authorization check: Admin, Course Trainer, or Enrolled Participant
	const isEnrolled = await Course.findEnrollment(user.id, lesson.course_id)
	const isTeacher = String(course.teacher_id) === String(user.id)
	const isAdmin = user.role === 'admin'

	if (!isEnrolled && !isTeacher && !isAdmin) {
		return res.status(403).json({ error: 'Access denied to this lesson' })
	}

	res.json(lesson)
}

const createLesson = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { course_id, title, order_index } = req.body
	if (!course_id || !title) {
		return res.status(400).json({ error: 'Course ID and title are required' })
	}

	const course = await Course.findById(course_id)
	if (!course) {
		return res.status(404).json({ error: 'Course not found' })
	}

	if (String(course.teacher_id) !== String(user.id) && user.role !== 'admin') {
		return res
			.status(403)
			.json({ error: 'Only the course creator or an admin can add lessons' })
	}

	const newLesson = await Lesson.createLesson({
		course_id,
		title,
		order_index: order_index || 0,
	})
	res.status(201).json(newLesson)
}

const addBlock = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { id } = req.params
	const { type, data } = req.body

	const lesson = await Lesson.findById(id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course || (String(course.teacher_id) !== String(user.id) && user.role !== 'admin')) {
		return res
			.status(403)
			.json({ error: 'Only the course creator or an admin can modify blocks' })
	}

	const allowedTypes = [
		'text',
		'zoom_card',
		'assessment_form',
		'recording_link',
		'file_attachment',
	]
	if (!allowedTypes.includes(type)) {
		return res.status(400).json({ error: 'Invalid block type' })
	}

	const block = {
		block_id: crypto.randomUUID(),
		type,
		data,
		created_at: new Date().toISOString(),
	}

	const updatedLesson = await Lesson.addContentBlock(id, block)
	res.json(updatedLesson)
}

const updateBlock = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { id, blockId } = req.params
	const updatedData = req.body

	const lesson = await Lesson.findById(id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course || (String(course.teacher_id) !== String(user.id) && user.role !== 'admin')) {
		return res
			.status(403)
			.json({ error: 'Only the course creator or an admin can modify blocks' })
	}

	const updatedLesson = await Lesson.updateContentBlock(
		id,
		blockId,
		updatedData,
	)
	res.json(updatedLesson)
}

const deleteBlock = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { id, blockId } = req.params

	const lesson = await Lesson.findById(id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course || (String(course.teacher_id) !== String(user.id) && user.role !== 'admin')) {
		return res
			.status(403)
			.json({ error: 'Only the course creator or an admin can modify blocks' })
	}

	const updatedLesson = await Lesson.removeContentBlock(id, blockId)
	res.json(updatedLesson)
}

const deleteLesson = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const lesson = await Lesson.findById(req.params.id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course || (String(course.teacher_id) !== String(user.id) && user.role !== 'admin')) {
		return res.status(403).json({
			error: 'Only the course creator or an admin can delete the lesson',
		})
	}

	const deleted = await Lesson.deleteLesson(req.params.id)
	res.status(204).end()
}

const updateLesson = async (req, res) => {
	const user = req.user
	if (!user) {
		return res.status(401).json({ error: 'Unauthorized' })
	}

	const { title, order_index } = req.body

	const lesson = await Lesson.findById(req.params.id)
	if (!lesson) {
		return res.status(404).json({ error: 'Lesson not found' })
	}

	const course = await Course.findById(lesson.course_id)
	if (!course || (String(course.teacher_id) !== String(user.id) && user.role !== 'admin')) {
		return res
			.status(403)
			.json({ error: 'Only the course creator or an admin can update the lesson' })
	}

	const updatedLesson = await Lesson.updateLesson(req.params.id, { title, order_index })
	res.json(updatedLesson)
}

module.exports = {
	getLesson,
	createLesson,
	updateLesson,
	addBlock,
	updateBlock,
	deleteBlock,
	deleteLesson,
}
