import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { PlusCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
	getLessonById,
	addBlock,
	updateBlock,
	deleteBlock,
} from '../../services/lessons'
import * as assessmentService from '../../services/assessments'

import BlockContainer from '../../components/BlockEditor/BlockContainer'
import BlockEditorModal from '../../components/BlockEditor/BlockEditorModal'
import TextBlock from '../../components/ContentBlocks/TextBlock'
import ZoomBlock from '../../components/ContentBlocks/ZoomBlock'
import AssessmentBlock from '../../components/ContentBlocks/AssessmentBlock'
import FileBlock from '../../components/ContentBlocks/FileBlock'
import LinkEmbedBlock from '../../components/ContentBlocks/LinkEmbedBlock'

const LessonPage = () => {
	const { t } = useTranslation()

	const { courseId, lessonId } = useParams()
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course.items)
	const activeCourse = courses.find(
		(c) => String(c.course_id) === String(courseId),
	)

	const [lesson, setLesson] = useState(null)
	const [assessments, setAssessments] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [isEditorOpen, setIsEditorOpen] = useState(false)
	const [editingBlock, setEditingBlock] = useState(null)
	const [insertAfterId, setInsertAfterId] = useState(null)

	const userRole = user?.role || ''
	const isCourseOwner = String(activeCourse?.teacher_id) === String(user?.id)
	const canEdit =
		userRole === 'admin' || (userRole === 'trainer' && isCourseOwner)

	useEffect(() => {
		const loadLesson = async () => {
			setIsLoading(true)
			try {
				const data = await getLessonById(lessonId)
				setLesson(data)

				// Load assessments for this lesson
				try {
					const assessmentList = await assessmentService.getByLesson(lessonId)
					// For students, also load their response status
					if (userRole === 'participant') {
						const withResponses = await Promise.all(
							assessmentList.map(async (a) => {
								try {
									const full = await assessmentService.getById(a.assessment_id)
									return full
								} catch {
									return a
								}
							}),
						)
						setAssessments(withResponses)
					} else {
						setAssessments(assessmentList)
					}
				} catch {
					setAssessments([])
				}
			} catch (error) {
				console.error('Failed to load lesson:', error)
			} finally {
				setIsLoading(false)
			}
		}

		if (lessonId) {
			loadLesson()
		}
	}, [lessonId, userRole])

	const handleEditClick = (block) => {
		setEditingBlock(block)
		setInsertAfterId(null)
		setIsEditorOpen(true)
	}

	const handleAddClick = (afterBlockId = null) => {
		setEditingBlock(null)
		setInsertAfterId(afterBlockId)
		setIsEditorOpen(true)
	}

	const handleDeleteClick = async (blockId) => {
		if (window.confirm(t('Are you sure you want to delete this block?'))) {
			try {
				const updatedLesson = await deleteBlock(lessonId, blockId)
				setLesson(updatedLesson)
			} catch (error) {
				console.error('Failed to delete block:', error)
			}
		}
	}

	const handleSaveBlock = async (blockData) => {
		try {
			let updatedLesson
			if (editingBlock) {
				updatedLesson = await updateBlock(
					lessonId,
					editingBlock.block_id,
					blockData,
				)
			} else {
				updatedLesson = await addBlock(lessonId, blockData)
			}
			setLesson(updatedLesson)
			setIsEditorOpen(false)
		} catch (error) {
			console.error('Failed to save block:', error)
		}
	}

	// Match assessment block by title to DB assessment
	const findAssessmentForBlock = (block) => {
		if (block.type !== 'assessment_form') return null
		return assessments.find(
			(a) =>
				a.title === block.data?.title ||
				a.title === block.data?.assessment_title,
		)
	}

	const renderBlockContent = (block) => {
		switch (block.type) {
			case 'text':
				return <TextBlock block={block} />
			case 'zoom_card':
				return <ZoomBlock block={block} />
			case 'assessment_form':
				return (
					<AssessmentBlock
						block={block}
						assessmentData={findAssessmentForBlock(block)}
						userRole={userRole}
					/>
				)
			case 'file_attachment':
				return <FileBlock block={block} />
			case 'recording_link':
				return <LinkEmbedBlock block={block} />
			default:
				return (
					<div className='p-4 bg-red-50 text-red-600 rounded-lg'>
						{t('Unknown Block Type:')} {block.type}
					</div>
				)
		}
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-full text-gray-500'>
				{t('Loading lesson content...')}
			</div>
		)
	}

	if (!lesson) {
		return (
			<div className='flex items-center justify-center h-full text-gray-500'>
				{t('Lesson not found.')}
			</div>
		)
	}

	const blocks = lesson.content_data || []

	return (
		<div className='flex flex-col items-center w-full min-h-full'>
			<header className='w-full bg-white px-8 md:px-16 py-10 border-b border-[#ecebea] flex items-center justify-between'>
				<div className='flex items-center gap-6'>
					<div>
						<div className='text-[0.85rem] text-gray-500 uppercase tracking-wide font-semibold mb-1'>
							{activeCourse?.title || t('Course')} / {lesson.title}
						</div>
						<h1 className='text-4xl text-[#514587] font-bold tracking-tight'>
							{lesson.title}
						</h1>
					</div>
				</div>
				{canEdit && (
					<button
						onClick={() =>
							navigate(
								`/dashboard/courses/${courseId}/lessons/${lessonId}/quiz/new`,
							)
						}
						className='inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#3f356d] hover:shadow-lg transition-all text-sm'
					>
						<PlusCircle size={18} />
						Create Quiz
					</button>
				)}
			</header>

			<div className='max-w-[1000px] w-full mx-auto px-5 py-10 pb-24'>
				{blocks.length === 0 && assessments.length === 0 && (
					<div className='text-center p-16 bg-white rounded-2xl border-2 border-dashed border-[#ecebea] text-gray-500'>
						<p className='mb-6 font-medium text-lg'>
							{t(
								'This lesson is currently empty. Add your first content block!',
							)}
						</p>
						{canEdit && (
							<button
								onClick={() => handleAddClick(null)}
								className='inline-flex items-center justify-center bg-[#514587] text-white py-3 px-6 rounded-xl border-none font-semibold cursor-pointer transition-all shadow-md hover:bg-[#3f356d] hover:shadow-lg hover:-translate-y-[1px]'
							>
								<PlusCircle size={20} className='mr-2' /> {t('Start Building')}
							</button>
						)}
					</div>
				)}

				{(blocks.length > 0 || assessments.length > 0) && canEdit && (
					<div className='flex justify-center mb-6'>
						<button
							className='bg-white border border-[#9484b4] text-[#514587] rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-sm transition-all hover:bg-[#514587] hover:text-white hover:scale-110 hover:shadow-md'
							onClick={() => handleAddClick(null)}
							title={t('Add a block at the very top')}
						>
							<PlusCircle size={24} />
						</button>
					</div>
				)}

				<div className='flex flex-col'>
					{blocks.map((block) => (
						<BlockContainer
							key={block.block_id}
							block={block}
							canEdit={canEdit}
							onEdit={handleEditClick}
							onDelete={handleDeleteClick}
							onAddBelow={handleAddClick}
						>
							{renderBlockContent(block)}
						</BlockContainer>
					))}
				</div>

				{/* Show standalone assessments that aren't linked to content blocks */}
				{assessments.length > 0 && (
					<div className='mt-8'>
						<h2 className='text-xl font-semibold text-primary mb-4'>Quizzes</h2>
						<div className='flex flex-col gap-4'>
							{assessments.map((a) => {
								const isCompleted = !!a.my_response
								const isTeacher = userRole === 'admin' || userRole === 'trainer'

								const handleQuizClick = () => {
									if (isTeacher) {
										navigate(
											`/dashboard/courses/${courseId}/lessons/${lessonId}/quiz/${a.assessment_id}/results`,
										)
									} else {
										navigate(
											`/dashboard/courses/${courseId}/lessons/${lessonId}/quiz/${a.assessment_id}`,
										)
									}
								}

								return (
									<div
										key={a.assessment_id}
										className={`flex justify-between items-center p-5 bg-white border rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow ${isCompleted ? 'border-l-4 border-l-success' : 'border-l-4 border-l-secondary'}`}
										onClick={handleQuizClick}
									>
										<div className='flex items-center gap-4'>
											<div className='shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
												<span className='text-primary font-bold'>Q</span>
											</div>
											<div>
												<h3 className='font-semibold text-gray-800'>
													{a.title}
												</h3>
												<p className='text-sm text-gray-500'>
													{a.assessment_json?.questions?.length || 0} questions
													{isCompleted &&
														` · Score: ${a.my_response.answers_json?.score}/${a.my_response.answers_json?.total_questions}`}
												</p>
											</div>
										</div>
										<span className='text-sm font-medium text-primary'>
											{isTeacher
												? 'View Results →'
												: isCompleted
													? 'View Submission →'
													: 'Start Quiz →'}
										</span>
									</div>
								)
							})}
						</div>
					</div>
				)}
			</div>

			<BlockEditorModal
				isOpen={isEditorOpen}
				onClose={() => setIsEditorOpen(false)}
				onSave={handleSaveBlock}
				initialData={editingBlock}
				isNew={!editingBlock}
			/>
		</div>
	)
}

export default LessonPage
