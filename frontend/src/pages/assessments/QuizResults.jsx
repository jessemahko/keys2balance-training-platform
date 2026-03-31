import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Users, BarChart3, Edit } from 'lucide-react'
import * as assessmentService from '../../services/assessments'

const QuizResults = () => {
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

	useEffect(() => {
		const load = async () => {
			try {
				const res = await assessmentService.getResults(assessmentId)
				setData(res)
			} catch (err) {
				setError(err?.response?.data?.error || 'Failed to load results')
			} finally {
				setIsLoading(false)
			}
		}
		load()
	}, [assessmentId])

	const goBack = () => {
		navigate(`/dashboard/courses/${courseId}/lessons/${lessonId}`)
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full text-gray-500">
				Loading results...
			</div>
		)
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-4">
				<p className="text-red-500 font-medium">{error}</p>
				<button onClick={goBack} className="text-primary hover:underline">
					Go back
				</button>
			</div>
		)
	}

	const { assessment, responses } = data
	const totalQuestions = assessment.assessment_json?.questions?.length || 0

	const avgScore =
		responses.length > 0
			? (
					responses.reduce(
						(sum, r) => sum + (r.answers_json?.score || 0),
						0,
					) / responses.length
				).toFixed(1)
			: 0

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
							{activeCourse?.title || 'Course'} / Results
						</div>
						<h1 className="text-3xl text-primary font-bold">
							{assessment.title}
						</h1>
					</div>
				</div>
				<button
					onClick={() =>
						navigate(
							`/dashboard/courses/${courseId}/lessons/${lessonId}/quiz/${assessmentId}/edit`,
						)
					}
					className="inline-flex items-center gap-2 text-primary border border-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/5 transition-colors"
				>
					<Edit size={18} />
					Edit Quiz
				</button>
			</header>

			<div className="max-w-[900px] w-full mx-auto px-5 py-10 pb-24">
				{/* Stats cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<div className="bg-white border border-border-color rounded-xl p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
							<Users size={24} className="text-primary" />
						</div>
						<div>
							<div className="text-2xl font-bold text-gray-800">
								{responses.length}
							</div>
							<div className="text-sm text-gray-500">Submissions</div>
						</div>
					</div>
					<div className="bg-white border border-border-color rounded-xl p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
							<BarChart3 size={24} className="text-success" />
						</div>
						<div>
							<div className="text-2xl font-bold text-gray-800">
								{avgScore}/{totalQuestions}
							</div>
							<div className="text-sm text-gray-500">Average Score</div>
						</div>
					</div>
					<div className="bg-white border border-border-color rounded-xl p-5 flex items-center gap-4">
						<div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
							<BarChart3 size={24} className="text-secondary" />
						</div>
						<div>
							<div className="text-2xl font-bold text-gray-800">
								{totalQuestions}
							</div>
							<div className="text-sm text-gray-500">Questions</div>
						</div>
					</div>
				</div>

				{/* Responses table */}
				{responses.length === 0 ? (
					<div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed border-border-color text-gray-500">
						<p className="font-medium text-lg">
							No students have taken this quiz yet.
						</p>
					</div>
				) : (
					<div className="bg-white border border-border-color rounded-xl overflow-hidden shadow-sm">
						<table className="w-full">
							<thead>
								<tr className="bg-gray-50 border-b border-border-color">
									<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
										Student
									</th>
									<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
										Email
									</th>
									<th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
										Score
									</th>
									<th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
										Percentage
									</th>
									<th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
										Submitted
									</th>
								</tr>
							</thead>
							<tbody>
								{responses.map((r) => {
									const score = r.answers_json?.score ?? 0
									const pct = totalQuestions
										? Math.round((score / totalQuestions) * 100)
										: 0
									return (
										<tr
											key={r.response_id}
											className="border-b border-border-color last:border-b-0 hover:bg-gray-50 transition-colors"
										>
											<td className="px-6 py-4 font-medium text-gray-800">
												{r.first_name} {r.last_name}
												<span className="text-gray-400 ml-2 text-sm">
													@{r.username}
												</span>
											</td>
											<td className="px-6 py-4 text-gray-600 text-sm">
												{r.email}
											</td>
											<td className="px-6 py-4 text-center font-bold">
												<span
													className={
														score === totalQuestions
															? 'text-success'
															: score >= totalQuestions / 2
																? 'text-gray-800'
																: 'text-red-500'
													}
												>
													{score}/{totalQuestions}
												</span>
											</td>
											<td className="px-6 py-4 text-center">
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
											</td>
											<td className="px-6 py-4 text-right text-sm text-gray-500">
												{new Date(r.submitted_at).toLocaleDateString('en-GB', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}

export default QuizResults
