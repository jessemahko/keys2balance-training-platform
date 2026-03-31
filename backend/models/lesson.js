const { pool } = require('../utils/config')


// Find one lesson by ID
const findById = async (lessonId) => {
	const res = await pool.query('SELECT * FROM lessons WHERE lesson_id = $1', [
		lessonId,
	])
	return res.rows[0] || null
}

// Create an empty lesson with JSONB container for blocks
const createLesson = async ({ course_id, title, order_index }) => {
	let idx = order_index
	if (idx === undefined || idx === null) {
		const maxRes = await pool.query(
			'SELECT MAX(order_index) AS max FROM lessons WHERE course_id = $1',
			[course_id],
		)
		const maxIdx = maxRes.rows[0].max
		idx = maxIdx !== null ? maxIdx + 1 : 0
	}
	const res = await pool.query(
		`INSERT INTO lessons (course_id, title, content_data, order_index)
		 VALUES ($1, $2, '[]'::jsonb, $3)
		 RETURNING *`,
		[course_id, title, idx],
	)
	return res.rows[0]
}

// Update lesson (title, order, or full content array)
const updateLesson = async (lessonId, updates) => {
	const fields = {
		title: 'title',
		orderIndex: 'order_index',
		contentData: 'content_data',
	}

	const entries = Object.entries(updates).filter(([key, value]) => {
		return Object.prototype.hasOwnProperty.call(fields, key) && value !== undefined
	})

	if (entries.length === 0) return findById(lessonId)

	const values = [lessonId]
	const setClauses = entries.map(([key, value], index) => {
		values.push(key === 'contentData' ? JSON.stringify(value) : value)
		return `${fields[key]} = $${index + 2}`
	})

	const res = await pool.query(
		`UPDATE lessons
		 SET ${setClauses.join(', ')}
		 WHERE lesson_id = $1
		 RETURNING *`,
		values,
	)
	return res.rows[0] || null
}

// Add a single content block to the content_data JSONB array
const addContentBlock = async (lessonId, block) => {
	const res = await pool.query(
		`UPDATE lessons 
		 SET content_data = content_data || jsonb_build_array($1::jsonb)
		 WHERE lesson_id = $2
		 RETURNING *`,
		[JSON.stringify(block), lessonId],
	)
	return res.rows[0]
}

const deleteLesson = async (lessonId) => {
	const res = await pool.query(
		'DELETE FROM lessons WHERE lesson_id = $1 RETURNING lesson_id',
		[lessonId],
	)
	return res.rows[0] || null
}

// Update a specific block inside the content_data JSONB array by block_id
const updateContentBlock = async (lessonId, blockId, updatedData) => {
	// Find the exact index of the block with the block_id
	// Update that specific element in the JSONB array
	const res = await pool.query(
		`UPDATE lessons 
		 SET content_data = (
			 SELECT jsonb_agg(
				 CASE 
					 WHEN elem->>'block_id' = $1 THEN elem || $2::jsonb
					 ELSE elem 
				 END
			 ) FROM jsonb_array_elements(content_data) AS elem
		 )
		 WHERE lesson_id = $3
		 RETURNING *`,
		[blockId, JSON.stringify(updatedData), lessonId],
	)
	return res.rows[0]
}

// Remove a specific block from the content_data JSONB array by block_id
const removeContentBlock = async (lessonId, blockId) => {
	const res = await pool.query(
		`UPDATE lessons 
		 SET content_data = (
			 SELECT jsonb_agg(elem) 
			 FROM jsonb_array_elements(content_data) AS elem 
			 WHERE elem->>'block_id' != $1
		 )
		 WHERE lesson_id = $2
		 RETURNING *`,
		[blockId, lessonId],
	)

	// Edge case: if the array becomes empty, jsonb_agg returns null instead of '[]'
	if (res.rows[0] && res.rows[0].content_data === null) {
		const emptyRes = await pool.query(
			`UPDATE lessons SET content_data = '[]'::jsonb WHERE lesson_id = $1 RETURNING *`,
			[lessonId]
		)
		return emptyRes.rows[0]
	}

	return res.rows[0]
}

module.exports = {
	findById,
	createLesson,
	updateLesson,
	addContentBlock,
	updateContentBlock,
	removeContentBlock,
	deleteLesson,
}
