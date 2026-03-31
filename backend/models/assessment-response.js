const { pool } = require('../utils/config')

const AssessmentResponse = {
	async submit({ assessmentId, userId, answersJson, score, totalQuestions, maxScore, manualScores, gradingStatus }) {
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
			max_score: maxScore,
			total_score: score,
			manual_scores: manualScores || {},
			grading_status: gradingStatus || 'complete',
		}
		const { rows } = await pool.query(query, [
			assessmentId,
			userId,
			JSON.stringify(answers),
		])
		return rows[0]
	},

	async getById(responseId) {
		const query = `SELECT * FROM assessment_responses WHERE response_id = $1`
		const { rows } = await pool.query(query, [responseId])
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

	async updateGrading(responseId, { manualScores, totalScore, gradingStatus }) {
		const query = `
            UPDATE assessment_responses
            SET answers_json = answers_json
              || jsonb_build_object(
                'manual_scores', $2::jsonb,
                'grading_status', $3::text,
                'total_score', $4::numeric
              )
            WHERE response_id = $1
            RETURNING *
        `
		const { rows } = await pool.query(query, [
			responseId,
			JSON.stringify(manualScores),
			gradingStatus,
			totalScore,
		])
		return rows[0]
	},
}

module.exports = AssessmentResponse
