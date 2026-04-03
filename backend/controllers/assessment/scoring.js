/**
 * Calculate quiz score.
 * Supports: single_choice (default), multiple_choice, open_text.
 * open_text questions are skipped (graded manually by trainer).
 */
const calculateScore = (questions, answers) => {
	let autoScore = 0
	let maxScore = 0
	let hasOpenText = false

	for (const q of questions) {
		const type = q.type || 'single_choice'

		if (type === 'open_text') {
			maxScore += q.max_points || 1
			hasOpenText = true
			continue
		}

		// Auto-scored questions worth 1 point each
		maxScore += 1
		const userAnswer = answers[q.id]

		if (type === 'multiple_choice') {
			if (!Array.isArray(userAnswer) || !Array.isArray(q.correct)) continue
			const sortedUser = [...userAnswer].sort()
			const sortedCorrect = [...q.correct].sort()
			if (
				sortedUser.length === sortedCorrect.length &&
				sortedUser.every((val, idx) => val === sortedCorrect[idx])
			) {
				autoScore++
			}
		} else {
			// single_choice (default for backward compat)
			if (userAnswer === q.correct) {
				autoScore++
			}
		}
	}
	return { autoScore, maxScore, hasOpenText }
}

module.exports = { calculateScore }
