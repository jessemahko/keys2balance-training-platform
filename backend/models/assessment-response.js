const { pool } = require('../utils/config')

const AssessmentResponse = {
	async submit({ assessmentId, userId, answersJson, score, totalQuestions }) {
		const query = `
            INSERT INTO assessment_responses
                (assessment_id, user_id, answers_json)
            VALUES ($1, $2, $3)
            ON CONFLICT (assessment_id, user_id)
            DO UPDATE SET answers_json = $3, submitted_at = NOW()
            RETURNING *
        `
		const answers = {
			answers: answersJson,
			score,
			total_questions: totalQuestions,
		}
		const { rows } = await pool.query(query, [
			assessmentId,
			userId,
			JSON.stringify(answers),
		])
		return rows[0]
	},

	async getByUserAndAssessment(userId, assessmentId) {
		const query = `
            SELECT *
            FROM assessment_responses
            WHERE user_id = $1 AND assessment_id = $2
        `
		const { rows } = await pool.query(query, [userId, assessmentId])
		return rows[0]
	},

	async getAllByAssessment(assessmentId) {
		const query = `
            SELECT ar.*, u.username, u.first_name, u.last_name, u.email
            FROM assessment_responses ar
            JOIN users u ON u.user_id = ar.user_id
            WHERE ar.assessment_id = $1
            ORDER BY ar.submitted_at DESC
        `
		const { rows } = await pool.query(query, [assessmentId])
		return rows
	},

	async getByUser(userId) {
		const query = `
            SELECT ar.*, a.title AS assessment_title, a.lesson_id,
                   l.title AS lesson_title, l.course_id
            FROM assessment_responses ar
            JOIN assessments a ON a.assessment_id = ar.assessment_id
            JOIN lessons l ON l.lesson_id = a.lesson_id
            WHERE ar.user_id = $1
            ORDER BY ar.submitted_at DESC
        `
		const { rows } = await pool.query(query, [userId])
		return rows
	},
}

module.exports = AssessmentResponse
