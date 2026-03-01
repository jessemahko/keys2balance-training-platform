const pool = require('../utils/config')

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
            assessmentJson
        ])
        return rows[0]
    },

    async getById(assessmentId) {
        const query = `
            SELECT *
            FROM assessments
            WHERE assessment_id = $1
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
    }
}

module.exports = Assessment