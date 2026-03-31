import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PlusCircle, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react'
import * as assessmentService from '../../services/assessments'

const emptyQuestion = () => ({
	id: Date.now(),
	question: '',
	options: ['', ''],
	correct: '',
})

const QuizEditor = () => {
	const { courseId, lessonId, assessmentId } = useParams()
	const navigate = useNavigate()
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course.items)
	const activeCourse = courses.find(
		(c) => String(c.course_id) === String(courseId),
	)

	const [title, setTitle] = useState('')
	const [questions, setQuestions] = useState([emptyQuestion()])
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState(null)
	const [isLoading, setIsLoading] = useState(!!assessmentId)

	useEffect(() => {
		if (assessmentId) {
			const loadAssessment = async () => {
				try {
					const data = await assessmentService.getById(assessmentId)
					setTitle(data.title)
					const q = data.assessment_json?.questions || []
					setQuestions(q.length > 0 ? q : [emptyQuestion()])
				} catch (err) {
					setError('Failed to load assessment')
				} finally {
					setIsLoading(false)
				}
			}
			loadAssessment()
		}
	}, [assessmentId])

	const updateQuestion = (index, field, value) => {
		setQuestions((prev) =>
			prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
		)
	}

	const updateOption = (qIndex, oIndex, value) => {
		setQuestions((prev) =>
			prev.map((q, i) => {
				if (i !== qIndex) return q
				const options = [...q.options]
				options[oIndex] = value
				return { ...q, options }
			}),
		)
	}

	const addOption = (qIndex) => {
		setQuestions((prev) =>
			prev.map((q, i) => {
				if (i !== qIndex) return q
				return { ...q, options: [...q.options, ''] }
			}),
		)
	}

	const removeOption = (qIndex, oIndex) => {
		setQuestions((prev) =>
			prev.map((q, i) => {
				if (i !== qIndex || q.options.length <= 2) return q
				const options = q.options.filter((_, idx) => idx !== oIndex)
				const correct =
					q.correct === q.options[oIndex] ? '' : q.correct
				return { ...q, options, correct }
			}),
		)
	}

	const addQuestion = () => {
		setQuestions((prev) => [...prev, emptyQuestion()])
	}

	const removeQuestion = (index) => {
		if (questions.length <= 1) return
		setQuestions((prev) => prev.filter((_, i) => i !== index))
	}

	const handleSave = async () => {
		setError(null)

		if (!title.trim()) {
			setError('Please enter a quiz title')
			return
		}

		for (let i = 0; i < questions.length; i++) {
			const q = questions[i]
			if (!q.question.trim()) {
				setError(`Question ${i + 1} is empty`)
				return
			}
			const filledOptions = q.options.filter((o) => o.trim())
			if (filledOptions.length < 2) {
				setError(`Question ${i + 1} needs at least 2 options`)
				return
			}
			if (!q.correct) {
				setError(`Question ${i + 1} has no correct answer selected`)
				return
			}
		}

		setSaving(true)
		try {
			const assessmentJson = {
				questions: questions.map((q, i) => ({
					id: i + 1,
					question: q.question,
					options: q.options.filter((o) => o.trim()),
					correct: q.correct,
				})),
			}

			if (assessmentId) {
				await assessmentService.update(assessmentId, {
					title,
					assessmentJson,
				})
			} else {
				await assessmentService.create({
					lessonId,
					title,
					assessmentJson,
				})
			}

			navigate(
				`/dashboard/courses/${courseId}/lessons/${lessonId}`,
			)
		} catch (err) {
			setError(err?.response?.data?.error || 'Failed to save quiz')
		} finally {
			setSaving(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full text-gray-500">
				Loading...
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center w-full min-h-full">
			<header className="w-full bg-white px-8 md:px-16 py-10 border-b border-border-color flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button
						onClick={() =>
							navigate(
								`/dashboard/courses/${courseId}/lessons/${lessonId}`,
							)
						}
						className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<ArrowLeft size={24} className="text-primary" />
					</button>
					<div>
						<div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">
							{activeCourse?.title || 'Course'} / Quiz Editor
						</div>
						<h1 className="text-3xl text-primary font-bold">
							{assessmentId ? 'Edit Quiz' : 'Create Quiz'}
						</h1>
					</div>
				</div>
			</header>

			<div className="max-w-[800px] w-full mx-auto px-5 py-10 pb-24">
				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
						{error}
					</div>
				)}

				{/* Quiz title */}
				<div className="mb-8">
					<label className="block font-semibold text-gray-800 mb-2">
						Quiz Title
					</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. Leadership Fundamentals Quiz"
						className="w-full px-4 py-3 border border-border-color rounded-lg text-base bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
					/>
				</div>

				{/* Questions */}
				<div className="flex flex-col gap-6">
					{questions.map((q, qIndex) => (
						<div
							key={q.id}
							className="bg-white border border-border-color rounded-xl p-6 shadow-sm"
						>
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-primary">
									Question {qIndex + 1}
								</h3>
								{questions.length > 1 && (
									<button
										onClick={() => removeQuestion(qIndex)}
										className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
										title="Remove question"
									>
										<Trash2 size={18} />
									</button>
								)}
							</div>

							<input
								type="text"
								value={q.question}
								onChange={(e) =>
									updateQuestion(qIndex, 'question', e.target.value)
								}
								placeholder="Enter your question..."
								className="w-full px-4 py-3 mb-4 border border-border-color rounded-lg text-base bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
							/>

							<div className="flex flex-col gap-2 mb-4">
								<label className="text-sm font-semibold text-gray-600">
									Options (click radio to set correct answer):
								</label>
								{q.options.map((opt, oIndex) => (
									<div
										key={oIndex}
										className="flex items-center gap-3"
									>
										<input
											type="radio"
											name={`correct-${q.id}`}
											checked={q.correct === opt && opt !== ''}
											onChange={() =>
												updateQuestion(qIndex, 'correct', opt)
											}
											disabled={!opt.trim()}
											className="w-4 h-4 accent-primary"
										/>
										<input
											type="text"
											value={opt}
											onChange={(e) => {
												const oldVal = opt
												updateOption(qIndex, oIndex, e.target.value)
												if (q.correct === oldVal) {
													updateQuestion(qIndex, 'correct', e.target.value)
												}
											}}
											placeholder={`Option ${oIndex + 1}`}
											className="flex-1 px-3 py-2 border border-border-color rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
										/>
										{q.options.length > 2 && (
											<button
												onClick={() => removeOption(qIndex, oIndex)}
												className="p-1 text-gray-400 hover:text-red-500 transition-colors"
												title="Remove option"
											>
												<Trash2 size={16} />
											</button>
										)}
									</div>
								))}
							</div>

							<button
								onClick={() => addOption(qIndex)}
								className="text-sm text-primary font-medium hover:underline"
							>
								+ Add Option
							</button>
						</div>
					))}
				</div>

				{/* Add question button */}
				<button
					onClick={addQuestion}
					className="mt-6 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border-color rounded-xl text-gray-500 font-medium hover:border-primary hover:text-primary transition-colors"
				>
					<PlusCircle size={20} />
					Add Question
				</button>

				{/* Save button */}
				<div className="mt-8 flex justify-end">
					<button
						onClick={handleSave}
						disabled={saving}
						className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-[#3f356d] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Save size={20} />
						{saving ? 'Saving...' : 'Save Quiz'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default QuizEditor
