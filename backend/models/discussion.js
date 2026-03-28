const { pool } = require('../utils/config')

const getThreadsByCourse = async (courseId) => {
	const res = await pool.query(
		`SELECT 
			dt.thread_id,
			dt.course_id,
			dt.title,
			dt.created_at,
			json_agg(
				json_build_object(
					'message_id', dm.message_id,
					'user_id', dm.user_id,
					'message_text', dm.message_text,
					'created_at', dm.created_at
				) ORDER BY dm.created_at ASC
			) FILTER (WHERE dm.message_id IS NOT NULL) as messages
		FROM discussion_threads dt
		LEFT JOIN discussion_messages dm ON dt.thread_id = dm.thread_id
		WHERE dt.course_id = $1
		GROUP BY dt.thread_id, dt.course_id, dt.title, dt.created_at
		ORDER BY dt.created_at DESC`,
		[courseId],
	)
	return res.rows
}

const createThread = async (courseId, title) => {
	const res = await pool.query(
		`INSERT INTO discussion_threads (course_id, title)
		 VALUES ($1, $2)
		 RETURNING *`,
		[courseId, title],
	)

	return { thread: res.rows[0], created: true }
}

const createMessage = async (threadId, userId, messageText) => {
	const res = await pool.query(
		'INSERT INTO discussion_messages (thread_id, user_id, message_text) VALUES ($1, $2, $3) RETURNING *',
		[threadId, userId, messageText],
	)
	return res.rows[0]
}

module.exports = {
	getThreadsByCourse,
	createThread,
	createMessage,
}
