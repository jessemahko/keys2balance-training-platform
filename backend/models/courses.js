const { pool } = require('../utils/config')

const findAll = async (userId) => {
	const res = await pool.query(
		`SELECT course_id, title, description, thumbnail_url, teacher_id, created_at
		 FROM courses
		 WHERE teacher_id = $1
		 ORDER BY created_at DESC`,
		[userId],
	)

	return res.rows
}

const findById = async (courseId, userId) => {
	const query = userId
		? {
				text: 'SELECT * FROM courses WHERE course_id = $1 AND teacher_id = $2',
				values: [courseId, userId],
			}
		: {
				text: 'SELECT * FROM courses WHERE course_id = $1',
				values: [courseId],
			}

	const res = await pool.query(query.text, query.values)

	return res.rows[0] || null
}

const normalizeTeacherId = (id) => {
	if (id === undefined || id === null) return null
	const normalizedId = String(id).trim()
	return normalizedId || null
}

const createCourse = async ({ title, description, thumbnailUrl, teacherId }) => {
	const res = await pool.query(
		`INSERT INTO courses (title, description, thumbnail_url, teacher_id)
		 VALUES ($1, $2, $3, $4)
		 RETURNING *`,
		[
			title,
			description === undefined ? null : description,
			thumbnailUrl === undefined ? null : thumbnailUrl,
			normalizeTeacherId(teacherId),
		],
	)

	return res.rows[0]
}

const updateCourse = async (courseId, updates) => {
	const fields = {
		title: 'title',
		description: 'description',
		thumbnailUrl: 'thumbnail_url',
		teacherId: 'teacher_id',
	}

	// normalize teacherId if provided
	if (updates.teacherId !== undefined) {
		updates.teacherId = normalizeTeacherId(updates.teacherId)
	}

	const entries = Object.entries(updates).filter(([key, value]) => {
		return Object.prototype.hasOwnProperty.call(fields, key) && value !== undefined
	})

	if (entries.length === 0) {
		return findById(courseId)
	}

	const values = [courseId]
	const setClauses = entries.map(([key, value], index) => {
		values.push(value)
		return `${fields[key]} = $${index + 2}`
	})

	const res = await pool.query(
		`UPDATE courses
		 SET ${setClauses.join(', ')}
		 WHERE course_id = $1
		 RETURNING *`,
		values,
	)

	return res.rows[0] || null
}

const deleteCourse = async (courseId) => {
	const res = await pool.query(
		'DELETE FROM courses WHERE course_id = $1 RETURNING course_id',
		[courseId],
	)

	return res.rows[0] || null
}

module.exports = {
	findAll,
	findById,
	createCourse,
	updateCourse,
	deleteCourse,
}
