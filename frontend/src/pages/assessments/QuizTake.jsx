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

	const handleSelect = (questionId, option, questionType) => {
		if (result) return
		if (questionType === 'multiple_choice') {
			setAnswers((prev) => {
				const current = Array.isArray(prev[questionId]) ? prev[questionId] : []
				const updated = current.includes(option)
					? current.filter((o) => o !== option)
					: [...current, option]
				return { ...prev, [questionId]: updated }
			})
		} else {
			setAnswers((prev) => ({ ...prev, [questionId]: option }))
		}
	}

	const handleSubmit = async () => {
		const questions = assessment.assessment_json?.questions || []
		const unanswered = questions.filter((q) => {
			const a = answers[q.id]
			const qType = q.type || 'single_choice'
			if (qType === 'open_text') return !a || !a.trim()
			if (qType === 'multiple_choice') return !Array.isArray(a) || a.length === 0
			return !a
		})
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
	const gradingStatus = result?.answers_json?.grading_status
	const maxScore = result?.answers_json?.max_score ?? result?.answers_json?.total_questions ?? questions.length
	const totalScore = gradingStatus === 'complete'
		? (result?.answers_json?.total_score ?? result?.answers_json?.score ?? 0)
		: (result?.answers_json?.score ?? 0)
	const score = totalScore
	const total = maxScore

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
						{gradingStatus === 'pending' ? (
							<div className="text-lg font-bold text-secondary">
								Grading in progress
							</div>
						) : (
							<div className={`text-3xl font-bold ${score === total ? 'text-success' : score >= total / 2 ? 'text-secondary' : 'text-red-500'}`}>
								{score}/{total}
							</div>
						)}
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
					<div className={`mb-8 p-6 rounded-xl border-2 ${
						gradingStatus === 'pending'
							? 'bg-amber-50 border-secondary'
							: score === total
								? 'bg-emerald-50 border-success'
								: 'bg-amber-50 border-secondary'
					}`}>
						{gradingStatus === 'pending' ? (
							<>
								<h2 className="text-xl font-bold mb-1">Submitted!</h2>
								<p className="text-gray-600">
									Some questions require manual grading by the trainer. Auto-scored: {result?.answers_json?.score ?? 0} points.
								</p>
							</>
						) : (
							<>
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
							</>
						)}
					</div>
				)}

				<div className="flex flex-col gap-6">
					{questions.map((q, index) => {
						const userAnswer = answers[q.id]
						const qType = q.type || 'single_choice'
						const isOpenText = qType === 'open_text'
						const isMultiple = qType === 'multiple_choice'
						let isCorrect, isWrong
						if (isOpenText) {
							isCorrect = false
							isWrong = false
						} else if (isMultiple) {
							const sorted = (arr) => [...(arr || [])].sort().join(',')
							isCorrect = result && sorted(userAnswer) === sorted(q.correct)
							isWrong = result && !isCorrect && Array.isArray(userAnswer) && userAnswer.length > 0
						} else {
							isCorrect = result && userAnswer === q.correct
							isWrong = result && userAnswer && userAnswer !== q.correct
						}

						return (
							<div
								key={q.id}
								className={`bg-white border rounded-xl p-6 shadow-sm ${
									result
										? isOpenText
											? 'border-border-color'
											: isCorrect
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

								{isOpenText ? (
									<div className="ml-11">
										<textarea
											value={answers[q.id] || ''}
											onChange={(e) => {
												if (result) return
												setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
											}}
											placeholder="Type your answer here..."
											rows={5}
											disabled={!!result}
											className="w-full px-4 py-3 border border-border-color rounded-lg text-base bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y disabled:bg-gray-50 disabled:text-gray-600"
										/>
										{result && (
											<div className="mt-2 text-sm text-gray-500">
												{result.answers_json?.manual_scores?.[q.id] !== undefined
													? `Score: ${result.answers_json.manual_scores[q.id]}/${q.max_points || 1}`
													: 'Awaiting trainer grading'}
											</div>
										)}
									</div>
								) : (
									<div className="flex flex-col gap-2 ml-11">
										{q.options.map((opt) => {
											const isSelected = isMultiple
												? Array.isArray(userAnswer) && userAnswer.includes(opt)
												: userAnswer === opt
											const isCorrectOpt = result && (
												isMultiple
													? Array.isArray(q.correct) && q.correct.includes(opt)
													: opt === q.correct
											)
											const isWrongSelection =
												result && isSelected && !isCorrectOpt

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
													onClick={() => handleSelect(q.id, opt, qType)}
												>
													{isMultiple ? (
														<div
															className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
																isSelected
																	? 'border-primary bg-primary'
																	: 'border-gray-300'
															}`}
														>
															{isSelected && (
																<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
																	<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
																</svg>
															)}
														</div>
													) : (
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
													)}
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
								)}
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
