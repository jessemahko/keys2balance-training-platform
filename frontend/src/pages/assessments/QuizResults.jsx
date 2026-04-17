import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
	ArrowLeft,
	Users,
	BarChart3,
	Edit,
	ChevronDown,
	ChevronUp,
} from 'lucide-react'
import * as assessmentService from '../../services/assessments'
import { styles } from '../style.js'
import { useTranslation } from 'react-i18next'

const QuizResults = () => {
	const { t } = useTranslation()
	const { courseId, lessonId, assessmentId } = useParams()
	const navigate = useNavigate()
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course.items)
	const activeCourse = courses.find(
		(c) => String(c.course_id) === String(courseId),
	)

	const [data, setData] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const [expandedResponse, setExpandedResponse] = useState(null)
	const [gradingScores, setGradingScores] = useState({})
	const [gradingSaving, setGradingSaving] = useState({})
	const [surveySort, setSurveySort] = useState({
		userId: null,
		asc: false, 
		})

	useEffect(() => {
		const load = async () => {
			try {
				const res = await assessmentService.getResults(assessmentId)
				setData(res)
			} catch (err) {
				setError(err?.response?.data?.error || t('Failed to load results'))
			} finally {
				setIsLoading(false)
			}
		}
		load()
	}, [assessmentId])

	const goBack = () => {
		navigate(`/courses/${courseId}/lessons/${lessonId}`)
	}

	if (isLoading) {
		return (
			<div style={styles.loadingContainer}>
				<div style={styles.loadingSpinner}></div>
				<p style={styles.loadingText}>{t('Loading results...')}</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className='flex flex-col items-center justify-center h-full gap-4'>
				<p className='text-red-500 font-medium'>{t(error)}</p>
				<button onClick={goBack} className='text-primary hover:underline'>
					{t('Go back')}
				</button>
			</div>
		)
	}

	const { assessment, responses } = data
	const questions = assessment.assessment_json?.questions || []
	const surveyQuestions = questions.filter((q) => q.type === 'survey')
	const studentTable = {}
	responses.forEach((r) => {
		const answers = r.answers_json?.answers || {}
		const id = String(r.user_id)

		if (!studentTable[id]) {
			studentTable[id] = {
				name: `${r.first_name} ${r.last_name}`,
				categories: {},
			}
		}

		surveyQuestions.forEach((q) => {
			const category = q.category || 'General'
			const selected = Array.isArray(answers[q.id]) ? answers[q.id] : []

			if (!studentTable[id].categories[category]) {
				studentTable[id].categories[category] = 0
			}

			studentTable[id].categories[category] += selected.length
		})
	})
	const categories = Array.from(
		new Set(surveyQuestions.map((q) => q.category || 'General'))
	)
	const sortedCategories = [...categories]
	if (surveySort.userId && studentTable[surveySort.userId]) {
		sortedCategories.sort((a, b) => {
			const valA = studentTable[surveySort.userId].categories[a] ?? 0
			const valB = studentTable[surveySort.userId].categories[b] ?? 0
			return surveySort.asc
				? valA - valB   // ASC
				: valB - valA   // DESC
		})
	}
	const openTextQuestions = questions.filter(
		(q) => (q.type || 'single_choice') === 'open_text',
	)
	const hasOpenText = openTextQuestions.length > 0

	const maxScore = questions.reduce(
		(sum, q) =>
			sum +
			((q.type || 'single_choice') === 'open_text' ? q.max_points || 1 : 1),
		0,
	)

	const getResponseScore = (r) => {
		if (
			r.answers_json?.grading_status === 'complete' &&
			r.answers_json?.total_score !== undefined
		) {
			return r.answers_json.total_score
		}
		return r.answers_json?.score ?? 0
	}

	const avgScore =
		responses.length > 0
			? (
					responses.reduce((sum, r) => sum + getResponseScore(r), 0) /
					responses.length
				).toFixed(1)
			: 0

	const handleGradeSubmit = async (responseId, questionId, score) => {
		const key = `${responseId}_${questionId}`
		setGradingSaving((prev) => ({ ...prev, [key]: true }))
		try {
			await assessmentService.gradeQuestion(
				assessmentId,
				responseId,
				questionId,
				score,
			)
			const res = await assessmentService.getResults(assessmentId)
			setData(res)
		} catch (err) {
			setError(err?.response?.data?.error || t('Failed to save grade'))
		} finally {
			setGradingSaving((prev) => ({ ...prev, [key]: false }))
		}
	}

	return (
		<div className='flex flex-col items-center w-full min-h-full'>
			<header className='w-full bg-white px-8 md:px-16 py-10 border-b border-border-color flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<button
						onClick={goBack}
						className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
					>
						<ArrowLeft size={24} className='text-primary' />
					</button>
					<div>
						<div className='text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1'>
							{activeCourse?.title || t('Course')} / {t('Results')}
						</div>
						<h1 className='text-3xl text-primary font-bold'>
							{assessment.title}
						</h1>
					</div>
				</div>
				<button
					onClick={() =>
						navigate(
							`/courses/${courseId}/lessons/${lessonId}/quiz/${assessmentId}/edit`,
						)
					}
					className='inline-flex items-center gap-2 text-primary border border-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/5 transition-colors'
				>
					<Edit size={18} />
					{t('Edit Quiz')}
				</button>
			</header>

			<div className='max-w-[900px] w-full mx-auto px-5 py-10 pb-24'>
				{/* Stats cards */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
					<div className='bg-white border border-border-color rounded-xl p-5 flex items-center gap-4'>
						<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
							<Users size={24} className='text-primary' />
						</div>
						<div>
							<div className='text-2xl font-bold text-gray-800'>
								{responses.length}
							</div>
							<div className='text-sm text-gray-500'>{t('Submissions')}</div>
						</div>
					</div>
					<div className='bg-white border border-border-color rounded-xl p-5 flex items-center gap-4'>
						<div className='w-12 h-12 rounded-full bg-success/10 flex items-center justify-center'>
							<BarChart3 size={24} className='text-success' />
						</div>
						<div>
							<div className='text-2xl font-bold text-gray-800'>
								{avgScore}/{maxScore}
							</div>
							<div className='text-sm text-gray-500'>{t('Average Score')}</div>
						</div>
					</div>
					<div className='bg-white border border-border-color rounded-xl p-5 flex items-center gap-4'>
						<div className='w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center'>
							<BarChart3 size={24} className='text-secondary' />
						</div>
						<div>
							<div className='text-2xl font-bold text-gray-800'>
								{questions.length}
							</div>
							<div className='text-sm text-gray-500'>{t('Questions')}</div>
						</div>
					</div>
				</div>

				{surveyQuestions.length > 0 && (
					<div className='mb-10'>
						<h2 className='text-xl font-bold mb-4'>{t('Survey Results')}</h2>
						<div className='relative'>
							<div className='overflow-x-auto w-full bg-white border border-border-color rounded-xl relative'>
							<table className='w-full'>
								<thead>
									<tr className='bg-gray-50 border-b'>
											{/* ROW HEADER = PARTICIPANT */}
										<th className='px-4 py-3 text-left w-[200px]'>
												{t('Participant')}
										</th>

										{/* COLUMNS = CATEGORIES */}
										{sortedCategories.map((cat) => (
											<th key={cat} className='px-4 py-3 text-center whitespace-nowrap'>
												{cat}
											</th>
										))}
									</tr>
								</thead>

								<tbody>
									{/* ROWS = STUDENTS */}
									{Object.entries(studentTable).map(([userId, data]) => (
										<tr key={userId} className='border-b'>
											<td
												className="px-4 py-3 font-semibold cursor-pointer select-none"
												onClick={() =>
													setSurveySort((prev) => {
														const isSame = prev.userId === userId

														return {
															userId: String(userId),
															asc: isSame ? !prev.asc : false, // first click = desc, second = asc
														}
													})
												}
											>
												{data.name}

												{surveySort.userId === userId && (
													<span className="ml-2 text-xs">
														{surveySort.asc ? '▲' : '▼'}
													</span>
												)}
											</td>

											{/* VALUES PER CATEGORY */}
											{sortedCategories.map((cat) => (
												<td key={cat} className='px-4 py-3 text-center'>
													{data.categories[cat] ?? 0}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
							</div>
							<div className='pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent rounded-r-xl border-r border-t border-b border-border-color'></div>
						</div>
					</div>
				)}

				{/* Responses table */}
				{responses.length === 0 ? (
					<div className='text-center p-16 bg-white rounded-2xl border-2 border-dashed border-border-color text-gray-500'>
						<p className='font-medium text-lg'>
							{t('No students have taken this quiz yet.')}
						</p>
					</div>
				) : (
					<div className='relative'>
						<div className='bg-white border border-border-color rounded-xl overflow-x-auto shadow-sm relative'>
						<table className='w-full'>
							<thead>
								<tr className='bg-gray-50 border-b border-border-color'>
									<th className='text-left px-6 py-4 text-sm font-semibold text-gray-600'>
											{t('Participant')}
									</th>
									<th className='text-left px-6 py-4 text-sm font-semibold text-gray-600'>
										{t('Email')}
									</th>
										{surveyQuestions.length === 0 && (
											<>
									<th className='text-center px-6 py-4 text-sm font-semibold text-gray-600'>
										{t('Score')}
									</th>
									<th className='text-center px-6 py-4 text-sm font-semibold text-gray-600'>
										{t('Percentage')}
									</th>
											</>
										)}
									<th className='text-right px-6 py-4 text-sm font-semibold text-gray-600'>
										{t('Submitted')}
									</th>
								</tr>
							</thead>
							<tbody>
								{responses.map((r) => {
									const rScore = getResponseScore(r)
									const pct = maxScore
										? Math.round((rScore / maxScore) * 100)
										: 0
									const isPending = r.answers_json?.grading_status === 'pending'
									const isExpanded = expandedResponse === r.response_id
									return (
										<>
											<tr
												key={r.response_id}
												className={`border-b border-border-color last:border-b-0 hover:bg-gray-50 transition-colors ${hasOpenText ? 'cursor-pointer' : ''}`}
												onClick={() =>
													hasOpenText &&
													setExpandedResponse(isExpanded ? null : r.response_id)
												}
											>
												<td className='px-6 py-4 font-medium text-gray-800'>
													{r.first_name} {r.last_name}
													<span className='text-gray-400 ml-2 text-sm'>
														@{r.username}
													</span>
												</td>
												<td className='px-6 py-4 text-gray-600 text-sm'>
													{r.email}
												</td>
													{surveyQuestions.length === 0 && (
														<>
												<td className='px-6 py-4 text-center font-bold'>
													{isPending ? (
														<span className='text-secondary text-sm font-semibold'>
															{t('Needs Grading')}
														</span>
													) : (
														<span
															className={
																rScore === maxScore
																	? 'text-success'
																	: rScore >= maxScore / 2
																		? 'text-gray-800'
																		: 'text-red-500'
															}
														>
															{rScore}/{maxScore}
														</span>
													)}
												</td>
												<td className='px-6 py-4 text-center'>
													{isPending ? (
														<span className='inline-block px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700'>
															{t('Pending')}
														</span>
													) : (
														<span
															className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
																pct >= 80
																	? 'bg-emerald-100 text-emerald-700'
																	: pct >= 50
																		? 'bg-amber-100 text-amber-700'
																		: 'bg-red-100 text-red-700'
															}`}
														>
															{pct}%
														</span>
													)}
												</td>
														</>
													)}
												<td className='px-6 py-4 text-right text-sm text-gray-500'>
													<div className='flex items-center justify-end gap-2'>
														{new Date(r.submitted_at).toLocaleDateString(
															'en-GB',
															{
																day: 'numeric',
																month: 'short',
																year: 'numeric',
																hour: '2-digit',
																minute: '2-digit',
															},
														)}
														{hasOpenText &&
															(isExpanded ? (
																<ChevronUp
																	size={16}
																	className='text-gray-400'
																/>
															) : (
																<ChevronDown
																	size={16}
																	className='text-gray-400'
																/>
															))}
													</div>
												</td>
											</tr>
											{isExpanded && (
												<tr key={`${r.response_id}-grade`}>
													<td colSpan={5} className='px-6 py-4 bg-gray-50'>
														<div className='space-y-4'>
															{openTextQuestions.map((q) => {
																const studentAnswer =
																	r.answers_json?.answers?.[q.id] ||
																	t('(no answer)')
																const existingScore =
																	r.answers_json?.manual_scores?.[q.id]
																const key = `${r.response_id}_${q.id}`
																return (
																	<div
																		key={q.id}
																		className='bg-white p-4 rounded-lg border border-border-color'
																	>
																		<h4 className='font-semibold text-gray-800 mb-2'>
																			Q{q.id}: {q.question}
																		</h4>
																		<p className='text-gray-700 bg-gray-50 p-3 rounded mb-3 whitespace-pre-wrap text-sm'>
																			{studentAnswer}
																		</p>
																		<div className='flex items-center gap-3'>
																			<label className='text-sm font-medium text-gray-600'>
																				{t('Score:')}
																			</label>
																			<input
																				type='number'
																				min={0}
																				max={q.max_points || 1}
																				value={
																					gradingScores[key] ??
																					existingScore ??
																					''
																				}
																				onChange={(e) =>
																					setGradingScores((prev) => ({
																						...prev,
																						[key]:
																							parseFloat(e.target.value) || 0,
																					}))
																				}
																				onClick={(e) => e.stopPropagation()}
																				className='w-20 px-2 py-1 border border-border-color rounded text-sm focus:outline-none focus:border-primary'
																			/>
																			<span className='text-sm text-gray-500'>
																				/ {q.max_points || 1}
																			</span>
																			<button
																				onClick={(e) => {
																					e.stopPropagation()
																					handleGradeSubmit(
																						r.response_id,
																						q.id,
																						gradingScores[key] ??
																							existingScore ??
																							0,
																					)
																				}}
																				disabled={gradingSaving[key]}
																				className='px-3 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-[#3f356d] transition-colors disabled:opacity-50'
																			>
																				{gradingSaving[key]
																					? t('Saving...')
																					: existingScore !== undefined
																						? t('Update')
																						: t('Grade')}
																			</button>
																		</div>
																	</div>
																)
															})}
														</div>
													</td>
												</tr>
											)}
										</>
									)
								})}
							</tbody>
						</table>
						</div>
						<div className='pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent rounded-r-xl border-r border-t border-b border-border-color'></div>
					</div>
				)}
			</div>
		</div>
	)
}

export default QuizResults