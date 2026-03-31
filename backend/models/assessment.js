const { pool } = require('../utils/config')

const Assessment = {
	async create({ lessonId, title, assessmentJson }) {
		const query = `
            INSERT INTO assessments (lesson_id, title, assessment_json)
            VALUES ($1, $2, $3)
            RETURNING *
        `
		const { rows } = await pool.query(query, [
			lessonId,
			title,
			JSON.stringify(assessmentJson),
		])
		return rows[0]
	},

	async getById(assessmentId) {
		const query = `
            SELECT a.*, l.title AS lesson_title, l.course_id
            FROM assessments a
            JOIN lessons l ON l.lesson_id = a.lesson_id
            WHERE a.assessment_id = $1
        `
		const { rows } = await pool.query(query, [assessmentId])
		return rows[0]
	},

	async getByLesson(lessonId) {
		const query = `
            SELECT *
            FROM assessments
            WHERE lesson_id = $1
            ORDER BY created_at DESC
        `
		const { rows } = await pool.query(query, [lessonId])
		return rows
	},

	async updateById(assessmentId, { title, assessmentJson }) {
		const query = `
            UPDATE assessments
            SET title = COALESCE($2, title),
                assessment_json = COALESCE($3, assessment_json)
            WHERE assessment_id = $1
            RETURNING *
        `
		const { rows } = await pool.query(query, [
			assessmentId,
			title || null,
			assessmentJson ? JSON.stringify(assessmentJson) : null,
		])
		return rows[0]
	},

	async deleteById(assessmentId) {
		const query = `
            DELETE FROM assessments
            WHERE assessment_id = $1
            RETURNING assessment_id
        `
		const { rows } = await pool.query(query, [assessmentId])
		return rows[0] || null
	},

	async getByCourse(courseId) {
		const query = `
            SELECT a.*, l.title AS lesson_title
            FROM assessments a
            JOIN lessons l ON l.lesson_id = a.lesson_id
            WHERE l.course_id = $1
            ORDER BY l.order_index, a.created_at
        `
		const { rows } = await pool.query(query, [courseId])
		return rows
	},
}

module.exports = Assessment
