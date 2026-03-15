const { pool } = require('../utils/config')

const findAll = async () => {
	const res = await pool.query('SELECT * FROM courses ORDER BY created_at DESC')
	return res.rows
}

const findAllByTeacherId = async (teacherId) => {
	const res = await pool.query(
		`SELECT * FROM courses
		 WHERE teacher_id = $1
		 ORDER BY created_at DESC`,
		[teacherId],
	)

	return res.rows
}

const findById = async (courseId) => {
	const res = await pool.query(
		`
			SELECT 
				c.*,

				COALESCE(
					json_agg(DISTINCT l) FILTER (WHERE l.lesson_id IS NOT NULL),
					'[]'
				) AS lessons,

				COALESCE(
					json_agg(
						DISTINCT jsonb_build_object(
							'user_id', u.user_id,
							'username', u.username,
							'email', u.email,
							'first_name', u.first_name,
							'last_name', u.last_name,
							'avatar_url', u.avatar_url,
							'role', u.role
						)
					) FILTER (WHERE u.user_id IS NOT NULL),
					'[]'
				) AS participants

			FROM courses c

			LEFT JOIN lessons l
				ON l.course_id = c.course_id

			LEFT JOIN course_enrollments ce
				ON ce.course_id = c.course_id

			LEFT JOIN users u
				ON u.user_id = ce.user_id

			WHERE c.course_id = $1

			GROUP BY c.course_id
		`,
		[courseId],
	)
	return res.rows[0] || null
}

const normalizeTeacherId = (id) => {
	if (id === undefined || id === null) return null
	const normalizedId = String(id).trim()
	return normalizedId || null
}

const createCourse = async ({
	title,
	description,
	thumbnailUrl,
	teacherId,
}) => {
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
		return (
			Object.prototype.hasOwnProperty.call(fields, key) && value !== undefined
		)
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

const enrollInCourse = async (userId, courseId) => {
	const res = await pool.query(
		`INSERT INTO course_enrollments (user_id, course_id)
		 VALUES ($1, $2)
		 ON CONFLICT DO NOTHING
		 RETURNING *`,
		[userId, courseId],
	)
	return res.rows[0] || null
}

const deleteEnrollment = async (userId, courseId) => {
	const res = await pool.query(
		`DELETE FROM course_enrollments WHERE user_id = $1 AND course_id = $2 RETURNING *`,
		[userId, courseId],
	)
	return res.rows[0] || null
}
module.exports = {
	findAll,
	findAllByTeacherId,
	findById,
	createCourse,
	updateCourse,
	deleteCourse,
	enrollInCourse,
	deleteEnrollment,
}
