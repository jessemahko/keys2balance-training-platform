import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react'
import * as assessmentService from '../../services/assessments'

const QuizTake = () => {
	const { courseId, lessonId, assessmentId } = useParams()
	const navigate = useNavigate()
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course.items)
	const activeCourse = courses.find(
		(c) => String(c.course_id) === String(courseId),
	)

	const [assessment, setAssessment] = useState(null)
	const [answers, setAnswers] = useState({})
	const [result, setResult] = useState(null)
	const [submitting, setSubmitting] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const load = async () => {
			try {
				const data = await assessmentService.getById(assessmentId)
				setAssessment(data)

				// If student already submitted, show result
				if (data.my_response) {
					setResult(data.my_response)
					const savedAnswers = data.my_response.answers_json?.answers || {}
					setAnswers(savedAnswers)
				}
			} catch (err) {
				setError('Failed to load quiz')
			} finally {
				setIsLoading(false)
			}
		}
		load()
	}, [assessmentId])

	const handleSelect = (questionId, option) => {
		if (result) return // Can't change answers after submission
		setAnswers((prev) => ({ ...prev, [questionId]: option }))
	}

	const handleSubmit = async () => {
		const questions = assessment.assessment_json?.questions || []
		const unanswered = questions.filter((q) => !answers[q.id])
		if (unanswered.length > 0) {
			setError(`Please answer all questions (${unanswered.length} remaining)`)
			return
		}

		setSubmitting(true)
		setError(null)
		try {
			const res = await assessmentService.submit(assessmentId, answers)
			setResult(res)
		} catch (err) {
			setError(err?.response?.data?.error || 'Failed to submit quiz')
		} finally {
			setSubmitting(false)
		}
	}

	const goBack = () => {
		navigate(`/dashboard/courses/${courseId}/lessons/${lessonId}`)
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full text-gray-500">
				Loading quiz...
			</div>
		)
	}

	if (!assessment) {
		return (
			<div className="flex items-center justify-center h-full text-gray-500">
				Quiz not found
			</div>
		)
	}

	const questions = assessment.assessment_json?.questions || []
	const score = result?.answers_json?.score ?? result?.score
	const total = result?.answers_json?.total_questions ?? result?.total_questions ?? questions.length

	return (
		<div className="flex flex-col items-center w-full min-h-full">
			<header className="w-full bg-white px-8 md:px-16 py-10 border-b border-border-color flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button
						onClick={goBack}
						className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<ArrowLeft size={24} className="text-primary" />
					</button>
					<div>
						<div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
							{activeCourse?.title || 'Course'} / Quiz
						</div>
						<h1 className="text-3xl text-primary font-bold">
							{assessment.title}
						</h1>
					</div>
				</div>
				{result && (
					<div className="text-right">
						<div className="text-sm text-gray-500 font-medium">Your Score</div>
						<div className={`text-3xl font-bold ${score === total ? 'text-success' : score >= total / 2 ? 'text-secondary' : 'text-red-500'}`}>
							{score}/{total}
						</div>
					</div>
				)}
			</header>

			<div className="max-w-[800px] w-full mx-auto px-5 py-10 pb-24">
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
						{error}
					</div>
				)}

				{result && (
					<div className={`mb-8 p-6 rounded-xl border-2 ${score === total ? 'bg-emerald-50 border-success' : 'bg-amber-50 border-secondary'}`}>
						<h2 className="text-xl font-bold mb-1">
							{score === total
								? 'Perfect Score!'
								: score >= total / 2
									? 'Good job!'
									: 'Keep studying!'}
						</h2>
						<p className="text-gray-600">
							You scored {score} out of {total} ({Math.round((score / total) * 100)}%)
						</p>
					</div>
				)}

				<div className="flex flex-col gap-6">
					{questions.map((q, index) => {
						const userAnswer = answers[q.id]
						const isCorrect = result && userAnswer === q.correct
						const isWrong = result && userAnswer && userAnswer !== q.correct

						return (
							<div
								key={q.id}
								className={`bg-white border rounded-xl p-6 shadow-sm ${
									result
										? isCorrect
											? 'border-success border-2'
											: isWrong
												? 'border-red-400 border-2'
												: 'border-border-color'
										: 'border-border-color'
								}`}
							>
								<div className="flex items-start gap-3 mb-4">
									<span className="shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
										{index + 1}
									</span>
									<h3 className="text-lg font-semibold text-gray-800 pt-0.5">
										{q.question}
									</h3>
								</div>

								<div className="flex flex-col gap-2 ml-11">
									{q.options.map((opt) => {
										const isSelected = userAnswer === opt
										const isCorrectOpt = result && opt === q.correct
										const isWrongSelection =
											result && isSelected && opt !== q.correct

										let optionClass =
											'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all '
										if (isCorrectOpt && result) {
											optionClass +=
												'bg-emerald-50 border-success text-emerald-800'
										} else if (isWrongSelection) {
											optionClass += 'bg-red-50 border-red-300 text-red-800'
										} else if (isSelected && !result) {
											optionClass +=
												'bg-primary/10 border-primary text-primary'
										} else {
											optionClass +=
												'border-border-color hover:border-primary-light hover:bg-gray-50'
										}

										if (result) {
											optionClass += ' cursor-default'
										}

										return (
											<div
												key={opt}
												className={optionClass}
												onClick={() => handleSelect(q.id, opt)}
											>
												<div
													className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
														isSelected
															? 'border-primary bg-primary'
															: 'border-gray-300'
													}`}
												>
													{isSelected && (
														<div className="w-2 h-2 rounded-full bg-white" />
													)}
												</div>
												<span className="font-medium">{opt}</span>
												{isCorrectOpt && result && (
													<CheckCircle
														size={18}
														className="ml-auto text-success"
													/>
												)}
												{isWrongSelection && (
													<XCircle
														size={18}
														className="ml-auto text-red-500"
													/>
												)}
											</div>
										)
									})}
								</div>
							</div>
						)
					})}
				</div>

				{!result && (
					<div className="mt-8 flex justify-end">
						<button
							onClick={handleSubmit}
							disabled={submitting}
							className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-[#3f356d] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Send size={20} />
							{submitting ? 'Submitting...' : 'Submit Answers'}
						</button>
					</div>
				)}

				{result && (
					<div className="mt-8 flex justify-center">
						<button
							onClick={goBack}
							className="inline-flex items-center gap-2 bg-white text-primary border border-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary/5 transition-colors"
						>
							<ArrowLeft size={20} />
							Back to Lesson
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default QuizTake
