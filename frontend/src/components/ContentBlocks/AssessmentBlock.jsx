import { ClipboardList, CheckCircle, ChevronRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

const AssessmentBlock = ({ block, assessmentData, userRole }) => {
	const { title, description } = block.data
	const navigate = useNavigate()
	const { courseId, lessonId } = useParams()

	// assessmentData comes from the DB assessment record matched to this block
	const hasDbAssessment = !!assessmentData
	const isCompleted = !!assessmentData?.my_response
	const isTeacher = userRole === 'admin' || userRole === 'trainer'

	const handleClick = () => {
		if (!hasDbAssessment) return

		if (isTeacher) {
			navigate(
				`/dashboard/courses/${courseId}/lessons/${lessonId}/quiz/${assessmentData.assessment_id}/results`,
			)
		} else if (isCompleted) {
			navigate(
				`/dashboard/courses/${courseId}/lessons/${lessonId}/quiz/${assessmentData.assessment_id}`,
			)
		} else {
			navigate(
				`/dashboard/courses/${courseId}/lessons/${lessonId}/quiz/${assessmentData.assessment_id}`,
			)
		}
	}

	const getButtonText = () => {
		if (!hasDbAssessment) return 'No Quiz Created'
		if (isTeacher) return 'View Results'
		if (isCompleted) return 'View Submission'
		return 'Start Quiz'
	}

	return (
		<div
			className={`flex justify-between items-center p-6 bg-white border border-border-color rounded-xl shadow-sm ${isCompleted ? 'border-l-4 border-l-success' : 'border-l-4 border-l-secondary'}`}
		>
			<div className="flex items-center gap-5">
				<div className="shrink-0">
					{isCompleted ? (
						<CheckCircle size={28} className="text-success" />
					) : (
						<ClipboardList size={28} className="text-primary" />
					)}
				</div>
				<div>
					<h3 className="text-lg text-primary mb-1 font-semibold">{title}</h3>
					{description && (
						<p className="text-gray-500 text-sm">{description}</p>
					)}
				</div>
			</div>

			<button
				onClick={handleClick}
				disabled={!hasDbAssessment}
				className="flex items-center shrink-0 gap-2 px-4 py-2 bg-transparent border border-border-color rounded-full text-gray-800 font-medium hover:bg-sidebar-bg hover:border-primary-light hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
			>
				<span>{getButtonText()}</span>
				<ChevronRight size={18} />
			</button>
		</div>
	)
}

export default AssessmentBlock
