import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PlusCircle, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react'
import * as assessmentService from '../../services/assessments'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { setNotification, setError } from '../../reducers/notiReducer'
import { styles } from '../style.js'

const emptyQuestion = () => ({
	id: Date.now(),
	type: 'single_choice',
	question: '',
	options: ['', ''],
	correct: '',
	category: '',
})

const QuizEditor = () => {
	const dispatch = useDispatch()
	const { courseId, lessonId, assessmentId } = useParams()
	const navigate = useNavigate()
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course.items)
	const activeCourse = courses.find(
		(c) => String(c.course_id) === String(courseId),
	)
	const { t } = useTranslation()

	const [title, setTitle] = useState('')
	const [questions, setQuestions] = useState([emptyQuestion()])
	const [saving, setSaving] = useState(false)
	const [error, setLocalError] = useState(null)
	const [isLoading, setIsLoading] = useState(!!assessmentId)
	const [description, setDescription] = useState('')

	useEffect(() => {
		if (assessmentId) {
			const loadAssessment = async () => {
				try {
					const data = await assessmentService.getById(assessmentId)
					setTitle(data.title)
					setDescription(data.description || '')
					const q = data.assessment_json?.questions || []
					setQuestions(q.length > 0 ? q : [emptyQuestion()])
				} catch (err) {
					dispatch(setError('Failed to load assessment', 5))
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
				const correct = q.correct === q.options[oIndex] ? '' : q.correct
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
			dispatch(setError('Please enter a quiz title', 5))
			return
		}

		for (let i = 0; i < questions.length; i++) {
			const q = questions[i]
			if (!q.question.trim()) {
				dispatch(
					setError(t('Question {{number}} is empty', { number: i + 1 }), 5),
				)
				return
			}
			const qType = q.type || 'single_choice'
			if (qType === 'open_text') continue

			if (qType === 'survey') {
				if (!q.category?.trim()) {
					dispatch(
						setError(
							t('Question {{number}} requires a category', { number: i + 1 }),
							5,
						),
					)
					return
				}
				const filledOptions = q.options.filter((o) => o.trim())
				if (filledOptions.length === 0) {
					dispatch(
						setError(
							t('Question {{number}} requires at least 1 option', {
								number: i + 1,
							}),
							5,
						),
					)
					return
				}
				continue
			}

			const filledOptions = q.options.filter((o) => o.trim())
			if (filledOptions.length < 2) {
				dispatch(
					setError(
						t('Question {{number}} needs at least 2 options', {
							number: i + 1,
						}),
						5,
					),
				)
				return
			}
			if (qType === 'multiple_choice') {
				if (!Array.isArray(q.correct) || q.correct.length === 0) {
					dispatch(
						setError(
							t('Question {{number}} has no correct answers selected', {
								number: i + 1,
							}),
							5,
						),
					)
					return
				}
			} else {
				if (!q.correct) {
					dispatch(
						setError(
							t('Question {{number}} has no correct answer selected', {
								number: i + 1,
							}),
							5,
						),
					)
					return
				}
			}
		}

		setSaving(true)
		try {
			const assessmentJson = {
				description,
				questions: questions.map((q, i) => {
					const base = {
						id: i + 1,
						type: q.type || 'single_choice',
						question: q.question,
					}
					if ((q.type || 'single_choice') === 'open_text') {
						return { ...base, max_points: q.max_points || 1 }
					}
					if (q.type === 'survey') {
						return {
							...base,
							options: q.options.filter((o) => o.trim()),
							category: q.category || 'General',
						}
					}
					return {
						...base,
						options: q.options.filter((o) => o.trim()),
						correct: q.correct,
					}
				}),
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

			navigate(`/courses/${courseId}/lessons/${lessonId}`)
		} catch (err) {
			dispatch(
				setError(err?.response?.data?.error || t('Failed to save quiz'), 5),
			)
		} finally {
			setSaving(false)
		}
	}

	if (isLoading) {
		return (
			<div style={styles.loadingContainer}>
				<div style={styles.loadingSpinner}></div>
				<p style={styles.loadingText}>{t('Loading...')}</p>
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center w-full min-h-full'>
			<header className='w-full bg-white px-8 md:px-16 py-10 border-b border-border-color flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<button
						onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
						className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
					>
						<ArrowLeft size={24} className='text-primary' />
					</button>
					<div>
						<div className='text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1'>
							{activeCourse?.title || t('Course')} / {t('Quiz Editor')}
						</div>
						<h1 className='text-3xl text-primary font-bold'>
							{assessmentId ? t('Edit Quiz') : t('Create Quiz')}
						</h1>
					</div>
				</div>
			</header>

			<div className='max-w-[800px] w-full mx-auto px-5 py-10 pb-24'>
				{error && (
					<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium'>
						{t(error)}
					</div>
				)}

				{/* Quiz title */}
				<div className='mb-8'>
					<label className='block font-semibold text-gray-800 mb-2'>
						{t('Quiz Title')}
					</label>
					<input
						type='text'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder={t('e.g. Leadership Fundamentals Quiz')}
						className='w-full px-4 py-3 border border-border-color rounded-lg text-base bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
					/>
				</div>

				{/* Quiz description*/}
				<div className='mb-8'>
					<label className='block font-semibold text-gray-800 mb-2'>
						{t('Description')} ({t('optional')})
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder={t('Enter quiz description...')}
						rows={3}
						className='w-full px-4 py-3 border border-border-color rounded-lg text-base bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y'
					/>
				</div>

				{/* Questions */}
				<div className='flex flex-col gap-6'>
					{questions.map((q, qIndex) => (
						<div
							key={q.id}
							className='bg-white border border-border-color rounded-xl p-6 shadow-sm'
						>
							<div className='flex items-center justify-between mb-4'>
								<h3 className='text-lg font-semibold text-primary'>
									{t('Question')} {qIndex + 1}
								</h3>
								{questions.length > 1 && (
									<button
										onClick={() => removeQuestion(qIndex)}
										className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'
										title={t('Remove question')}
									>
										<Trash2 size={18} />
									</button>
								)}
							</div>

							<input
								type='text'
								value={q.question}
								onChange={(e) =>
									updateQuestion(qIndex, 'question', e.target.value)
								}
								placeholder={t('Enter your question...')}
								className='w-full px-4 py-3 mb-4 border border-border-color rounded-lg text-base bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
							/>

							{q.type === 'survey' && (
								<input
									type='text'
									value={q.category || ''}
									onChange={(e) =>
										updateQuestion(qIndex, 'category', e.target.value)
									}
									placeholder={t('Category (e.g. Leadership, Manager)')}
									className='w-full px-4 py-3 mb-4 border border-border-color rounded-lg text-base bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
								/>
							)}

							<div className='flex items-center gap-3 mb-4'>
								<label className='text-sm font-semibold text-gray-600'>
									{t('Type:')}
								</label>
								<select
									value={q.type || 'single_choice'}
									onChange={(e) => {
										const newType = e.target.value
										updateQuestion(qIndex, 'type', newType)
										if (newType === 'multiple_choice') {
											updateQuestion(qIndex, 'correct', [])
										} else if (newType === 'open_text') {
											updateQuestion(qIndex, 'correct', null)
											updateQuestion(qIndex, 'options', [])
											if (!q.max_points) updateQuestion(qIndex, 'max_points', 1)
										} else {
											updateQuestion(qIndex, 'correct', '')
										}
									}}
									className='px-3 py-2 border border-border-color rounded-lg text-sm bg-white focus:outline-none focus:border-primary'
								>
									<option value='single_choice'>{t('Single Choice')}</option>
									<option value='multiple_choice'>
										{t('Multiple Choice')}
									</option>
									<option value='open_text'>{t('Open Text')}</option>
									<option value='survey'>{t('Survey')}</option>
								</select>
							</div>

							{(q.type || 'single_choice') === 'open_text' ? (
								<div className='flex items-center gap-3 mb-4'>
									<label className='text-sm font-semibold text-gray-600'>
										{t('Max Points:')}
									</label>
									<input
										type='number'
										min={1}
										value={q.max_points || 1}
										onChange={(e) =>
											updateQuestion(
												qIndex,
												'max_points',
												parseInt(e.target.value) || 1,
											)
										}
										className='w-24 px-3 py-2 border border-border-color rounded-lg text-sm bg-white focus:outline-none focus:border-primary'
									/>
									<span className='text-sm text-gray-400'>
										{t('(Trainer will grade manually)')}
									</span>
								</div>
							) : (
								<>
									<div className='flex flex-col gap-2 mb-4'>
										<label className='text-sm font-semibold text-gray-600'>
											{q.type === 'multiple_choice' &&
												t('Options (check all correct answers):')}
											{q.type == 'single_choice' &&
												t('Options (click radio to set correct answer):')}

											{q.type === 'survey' && `${t('Options')}:`}
										</label>
										{q.options.map((opt, oIndex) => (
											<div key={oIndex} className='flex items-center gap-3'>
												{q.type === 'survey' ? (
													<div className='w-4'></div>
												) : q.type === 'multiple_choice' ? (
													<input
														type='checkbox'
														checked={
															Array.isArray(q.correct) &&
															q.correct.includes(opt) &&
															opt !== ''
														}
														onChange={() => {
															if (!opt.trim()) return
															const current = Array.isArray(q.correct)
																? q.correct
																: []
															const updated = current.includes(opt)
																? current.filter((c) => c !== opt)
																: [...current, opt]
															updateQuestion(qIndex, 'correct', updated)
														}}
														disabled={!opt.trim()}
														className='w-4 h-4 accent-primary'
													/>
												) : (
													<input
														type='radio'
														name={`correct-${q.id}`}
														checked={q.correct === opt && opt !== ''}
														onChange={() =>
															updateQuestion(qIndex, 'correct', opt)
														}
														disabled={!opt.trim()}
														className='w-4 h-4 accent-primary'
													/>
												)}
												<input
													type='text'
													value={opt}
													onChange={(e) => {
														const oldVal = opt
														updateOption(qIndex, oIndex, e.target.value)
														if (
															(q.type || 'single_choice') === 'multiple_choice'
														) {
															if (
																Array.isArray(q.correct) &&
																q.correct.includes(oldVal)
															) {
																const updated = q.correct.map((c) =>
																	c === oldVal ? e.target.value : c,
																)
																updateQuestion(qIndex, 'correct', updated)
															}
														} else {
															if (q.correct === oldVal) {
																updateQuestion(
																	qIndex,
																	'correct',
																	e.target.value,
																)
															}
														}
													}}
													placeholder={t('Option {{number}}', {
														number: oIndex + 1,
													})}
													className='flex-1 px-3 py-2 border border-border-color rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
												/>
												{q.options.length > 2 && (
													<button
														onClick={() => removeOption(qIndex, oIndex)}
														className='p-1 text-gray-400 hover:text-red-500 transition-colors'
														title={t('Remove option')}
													>
														<Trash2 size={16} />
													</button>
												)}
											</div>
										))}
									</div>

									<button
										onClick={() => addOption(qIndex)}
										className='text-sm text-primary font-medium hover:underline'
									>
										+ {t('Add Option')}
									</button>
								</>
							)}
						</div>
					))}
				</div>

				{/* Add question button */}
				<button
					onClick={addQuestion}
					className='mt-6 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border-color rounded-xl text-gray-500 font-medium hover:border-primary hover:text-primary transition-colors'
				>
					<PlusCircle size={20} />
					{t('Add Question')}
				</button>

				{/* Save button */}
				<div className='mt-8 flex justify-end'>
					<button
						onClick={handleSave}
						disabled={saving}
						className='inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-[#3f356d] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
					>
						<Save size={20} />
						{saving ? t('Saving...') : t('Save Quiz')}
					</button>
				</div>
			</div>
		</div>
	)
}

export default QuizEditor
