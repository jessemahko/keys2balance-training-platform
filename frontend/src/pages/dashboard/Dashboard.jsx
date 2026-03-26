import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
	Link,
	Navigate,
	NavLink,
	Route,
	Routes,
	useParams,
} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar/Sidebar'
import LessonTitleModal from '../../components/Sidebar/LessonTitleModal'
import { Menu as MenuIcon } from 'lucide-react'
import { setCoursesFn, fetchCourseByIdFn } from '../../reducers/courseReducer'
import CourseForm from '../courses/CourseForm'
import ParticipantModal from '../courses/ParticipantModal'
import LessonPage from '../courses/LessonPage'
import { useMatch } from 'react-router-dom'
import { createLesson, updateLesson, deleteLesson as deleteLessonService } from '../../services/lessons'
import { setNoti, setError } from '../../reducers/notiReducer'

const LESSON_FILTERS = {
	ready: 'ready',
	draft: 'draft',
}

const getErrorMessage = (error, fallbackMessage) => {
	return error?.response?.data?.error || fallbackMessage
}

const sortLessons = (lessons = []) => {
	return [...lessons].sort((a, b) => {
		const left = Number(a.order_index ?? 0)
		const right = Number(b.order_index ?? 0)
		return left - right
	})
}

const formatDisplayName = (user) => {
	const firstName =
		user?.first_name ||
		user?.firstName ||
		(typeof user?.name === 'string' ? user.name.split(' ')[0] : '')

	if (firstName) return firstName

	const email = user?.email || ''
	if (!email) return 'Learner'

	const rawName = email.split('@')[0]
	const parts = rawName
		.split(/[._-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))

	return parts.join(' ') || 'Learner'
}

const normalizeSearchValue = (value) => {
	return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

const getLessonContentCount = (lesson) => {
	return Array.isArray(lesson?.content_data) ? lesson.content_data.length : 0
}

const getLessonStatus = (lesson) => {
	return getLessonContentCount(lesson) > 0 ? LESSON_FILTERS.ready : LESSON_FILTERS.draft
}

const DashboardHome = ({ courses, isLoading, user }) => {
	const [searchTerm, setSearchTerm] = useState('')
	const deferredSearchTerm = useDeferredValue(searchTerm)
	const normalizedSearchTerm = normalizeSearchValue(deferredSearchTerm)
	const filteredCourses = useMemo(() => {
		return courses.filter((course) => {
			return (
				!normalizedSearchTerm ||
				`${course.title ?? ''} ${course.description ?? ''}`
					.toLowerCase()
					.includes(normalizedSearchTerm)
			)
		})
	}, [courses, normalizedSearchTerm])
	const hasActiveSearch = searchTerm.trim().length > 0

	const userRole = user?.role || ''
	const canCreateCourse = userRole === 'admin' || userRole === 'trainer'

	if (isLoading) {
		return <section className='dashboard-panel'>Loading courses...</section>
	}

	return (
		<div className='grid gap-[1.35rem] max-w-[1220px] mx-auto'>
			<section className='p-[1rem_0_0.35rem]'>
				<div className='flex justify-between items-center w-full gap-4 flex-wrap'>
					<div>
						<h1 className='m-0 text-[#222]'>Welcome back!</h1>
						<p className='m-0 text-[#666] leading-relaxed'>Search your assigned courses below.</p>
					</div>
					{canCreateCourse && (
						<Link to='/dashboard/courses/new' className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#33b5aa] text-white transition-opacity hover:opacity-90 whitespace-nowrap'>
							Create New Course
						</Link>
					)}
				</div>
			</section>

			{courses.length ? (
				<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-[0.85rem]'>
					<div className='grid gap-[0.9rem]'>
						<label className='grid gap-[0.45rem]'>
							<span className='text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#7a7a7a]'>Search courses</span>
							<input
								type='search'
								className='w-full p-[0.85rem_1rem] border border-[#4d458d]/[0.16] rounded-[14px] bg-[#f8f8fb] text-[#222] focus:outline-none focus:ring-2 focus:ring-[#5f4b96]/20 focus:border-[#5f4b96]'
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder='Search by course title or description'
							/>
						</label>
					</div>

					<div className='flex flex-wrap items-center justify-between gap-[0.75rem]'>
						<p className='text-[#666]'>
							Showing {filteredCourses.length} of {courses.length} courses
						</p>
						{hasActiveSearch ? (
							<button
								type='button'
								className='border-0 p-0 bg-transparent text-[#4d458d] font-bold cursor-pointer hover:underline'
								onClick={() => setSearchTerm('')}
							>
								Clear search
							</button>
						) : null}
					</div>
				</section>
			) : null}

			{filteredCourses.length ? (
				<section className='grid gap-4 md:grid-cols-2'>
					{filteredCourses.map((course) => (
						<Link
							key={course.course_id}
							to={`/dashboard/courses/${course.course_id}`}
							className='grid gap-4 p-5 bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] rounded-[18px] text-inherit transition-all duration-180 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_16px_32px_rgba(90,90,90,0.12)] no-underline'
						>
							<div className='flex items-start justify-between gap-3'>
								<h3 className='m-0 text-[#222]'>{course.title}</h3>
								<span className='p-[0.35rem_0.75rem] rounded-full bg-[#edf5ff] text-[#4d458d] text-[0.8rem] font-bold whitespace-nowrap'>Course</span>
							</div>
							<p className='m-0 text-[#666] leading-relaxed'>
								{course.description ||
									'Open the course overview to access lessons.'}
							</p>
							<div className='flex flex-wrap gap-2 text-[#7a7a7a] text-[0.9rem] font-semibold'>
								<span>{Number(course.lesson_count ?? 0)} lessons</span>
							</div>
							<div className='flex items-center justify-between text-[#27a665] font-bold'>
								<span>View course</span>
								<span className='text-2xl leading-none'>&rsaquo;</span>
							</div>
						</Link>
					))}
				</section>
			) : courses.length ? (
				<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
					<h2 className='m-0 text-[#222]'>No matching courses</h2>
					<p className='m-0 text-[#666] leading-relaxed'>Try another search term or clear the current search.</p>
				</section>
			) : (
				<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
					<h2 className='m-0 text-[#222]'>No active courses yet</h2>
					<p className='m-0 text-[#666] leading-relaxed'>Your assigned courses will show here once enrollment is set up.</p>
				</section>
			)}
		</div>
	)
}

const CourseDetail = ({ courses, onError }) => {
	const { courseId } = useParams()
	const cachedCourse = useMemo(
		() => courses.find((course) => String(course.course_id) === String(courseId)) || null,
		[courses, courseId],
	)
	const course = cachedCourse
	const isLoading = useSelector((state) => state.course.isLoading)
	const loadError = useSelector((state) => state.course.error)
	const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false)
	const user = useSelector((state) => state.user)
	const userRole = user?.role || ''
	const currentUserId = user?.id || ''
	const dispatch = useDispatch()
	const [lessonSearchTerm, setLessonSearchTerm] = useState('')
	const deferredLessonSearchTerm = useDeferredValue(lessonSearchTerm)
	const lessons = useMemo(() => sortLessons(course?.lessons), [course])
	const normalizedLessonSearchTerm = normalizeSearchValue(
		deferredLessonSearchTerm,
	)
	const filteredLessons = useMemo(() => {
		return lessons.filter((lesson) => {
			return (
				!normalizedLessonSearchTerm ||
				`${lesson.title ?? ''} ${lesson.order_index ?? ''}`
					.toLowerCase()
					.includes(normalizedLessonSearchTerm)
			)
		})
	}, [lessons, normalizedLessonSearchTerm])
	const hasActiveLessonSearch = lessonSearchTerm.trim().length > 0

	useEffect(() => {
		dispatch(fetchCourseByIdFn(courseId))
	}, [courseId, dispatch])

	if (isLoading) {
		return <section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4'>Loading course...</section>
	}

	if (loadError || !course) {
		return (
			<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
				<h2 className='m-0 text-[#222]'>We could not open this course</h2>
				<p className='m-0 text-[#666] leading-relaxed'>{loadError || 'The requested course does not exist.'}</p>
				<Link to='/dashboard' className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#33b5aa] text-white transition-opacity hover:opacity-90'>
					Back to courses
				</Link>
			</section>
		)
	}

	const participants = Array.isArray(course.participants) ? course.participants : []

	const isCourseOwner = String(course.teacher_id) === String(currentUserId)
	const canManageCourse = userRole === 'admin' || (userRole === 'trainer' && isCourseOwner)

	const handleParticipantsChanged = async () => {
		try {
			await dispatch(fetchCourseByIdFn(courseId))
		} catch (err) {
			console.error(err)
		}
	}

	return (
		<div className='grid gap-[1.35rem] max-w-[1220px] mx-auto'>
			<div className='grid gap-[0.4rem]'>
				<Link to='/dashboard' className='w-fit text-[#4d458d] font-bold no-underline hover:underline'>
					Courses
				</Link>
				<h1 className='m-0 text-[#222]'>{course.title}</h1>
			</div>

			<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4'>
				<h2 className='m-0 text-[#222]'>Welcome to {course.title}</h2>
				<p className='m-0 text-[#666] leading-relaxed'>
					{course.description ||
						'Access your course contents and track your progress below.'}
				</p>
			</section>

			<section className='grid gap-4 md:grid-cols-2'>
				<article className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4'>
					<h3 className='m-0 text-[#222]'>Course snapshot</h3>
					<div className='grid gap-[0.8rem] md:grid-cols-2'>
						<div className='p-[0.95rem_1rem] rounded-[14px] bg-[#f5f7fb]'>
							<span className='block mb-[0.35rem] text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]'>Total lessons</span>
							<strong className='text-2xl text-[#4d458d]'>{lessons.length}</strong>
						</div>
						<div className='p-[0.95rem_1rem] rounded-[14px] bg-[#f5f7fb]'>
							<span className='block mb-[0.35rem] text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[#7a7a7a]'>Participants</span>
							<strong className='text-2xl text-[#4d458d]'>{participants.length}</strong>
						</div>
					</div>
					<div className='flex flex-col gap-4 mt-4'>
						<Link
							to={`/courses/${course.course_id}/discussion`}
							className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#14b8a6] text-white transition-opacity hover:opacity-90 no-underline'
						>
							Go to discussions
						</Link>
						{canManageCourse && (
							<>
								<Link
									to={`/dashboard/courses/${course.course_id}/edit`}
									className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-white text-[#0f172a] border border-[#cbd5e1] transition-colors hover:bg-gray-50 no-underline'
								>
									Edit Course
								</Link>
								<button
									onClick={() => setIsParticipantModalOpen(true)}
									className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#0f172a] text-white border border-[#cbd5e1] transition-opacity hover:opacity-90'
								>
									Manage Participants
								</button>
							</>
						)}
					</div>
				</article>

				{isParticipantModalOpen && (
					<ParticipantModal
						isOpen={isParticipantModalOpen}
						onClose={() => setIsParticipantModalOpen(false)}
						course={course}
						onParticipantsChanged={handleParticipantsChanged}
					/>
				)}

				<article className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4'>
					<h3 className='m-0 text-[#222]'>Instructor</h3>
					{course.teacher?.user_id ? (
						<div className="instructor-profile flex items-center gap-4 mt-4">
							<div className="instructor-avatar w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
								{course.teacher.avatar_url ? (
									<img src={course.teacher.avatar_url} alt={course.teacher.first_name} className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full flex items-center justify-center text-[#514587] font-bold bg-[#514587]/10">
										{course.teacher.first_name?.charAt(0) || course.teacher.username?.charAt(0) || 'T'}
									</div>
								)}
							</div>
							<div className="instructor-info">
								<div className="font-bold text-gray-800">
									{[course.teacher.first_name, course.teacher.last_name].filter(Boolean).join(' ') || course.teacher.username}
								</div>
								<div className="text-sm text-gray-500">{course.teacher.email}</div>
							</div>
						</div>
					) : (
						<p className="text-gray-500 italic mt-2">No instructor assigned yet.</p>
					)}
				</article>

				<article className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 md:col-span-2'>
					<div className='flex items-end justify-between gap-4'>
						<div>
							<h3 className='m-0 text-[#222]'>Lesson preview</h3>
							<p className='m-0 text-[#666] leading-relaxed'>Quick access to your course lessons.</p>
						</div>
					</div>

					{lessons.length ? (
						<>
							<div className='grid gap-[0.9rem]'>
								<label className='grid gap-[0.45rem]'>
									<span className='text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#7a7a7a]'>Search lessons</span>
									<input
										type='search'
										className='w-full p-[0.85rem_1rem] border border-[#4d458d]/[0.16] rounded-[14px] bg-[#f8f8fb] text-[#222] focus:outline-none focus:ring-2 focus:ring-[#5f4b96]/20 focus:border-[#5f4b96]'
										value={lessonSearchTerm}
										onChange={(event) =>
											setLessonSearchTerm(event.target.value)
										}
										placeholder='Search by lesson title or number'
									/>
								</label>
							</div>

							<div className='flex flex-wrap items-center justify-between gap-[0.75rem]'>
								<p className='text-[#666]'>
									Showing {filteredLessons.length} of {lessons.length} lessons
								</p>
								{hasActiveLessonSearch ? (
									<button
										type='button'
										className='border-0 p-0 bg-transparent text-[#4d458d] font-bold cursor-pointer hover:underline'
										onClick={() => setLessonSearchTerm('')}
									>
										Clear search
									</button>
								) : null}
							</div>
						</>
					) : null}

					{filteredLessons.length ? (
						<div className='grid gap-[0.8rem]'>
							{filteredLessons.map((lesson, index) => {
								const lessonStatus = getLessonStatus(lesson)
								const lessonNumber = Number(lesson.order_index ?? index + 1)

								return (
									<Link
										key={lesson.lesson_id}
										to={`/dashboard/courses/${course.course_id}/lessons/${lesson.lesson_id}`}
										className='flex items-center gap-[0.9rem] p-[0.95rem_1rem] rounded-[16px] bg-[#f7f7f7] no-underline text-inherit group transition-colors hover:bg-gray-100'
									>
										<span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#5f4b96] text-white font-bold shrink-0'>{lessonNumber}</span>
										<div className='flex-1'>
											<strong className='block mb-[0.2rem]'>{lesson.title}</strong>
											<p className='m-0 text-[#666] leading-relaxed'>
												{lessonStatus === LESSON_FILTERS.ready
													? 'Ready to view'
													: 'Outline only'}
											</p>
										</div>
										<span
											className={`inline-flex items-center justify-center p-[0.4rem_0.75rem] rounded-full text-[0.8rem] font-bold ${
												lessonStatus === LESSON_FILTERS.ready
													? 'bg-[#e3f8ed] text-[#157347]'
													: 'bg-[#fff1da] text-[#915400]'
											}`}
										>
											{lessonStatus === LESSON_FILTERS.ready
												? 'Ready'
												: 'Outline'}
										</span>
									</Link>
								)
							})}
						</div>
					) : lessons.length ? (
						<p>No lessons match the current search.</p>
					) : (
						<p>No lessons are published for this course yet.</p>
					)}
				</article>
			</section>
		</div>
	)
}

const SectionPlaceholder = ({ title, description, backTo, actionLabel }) => {
	return (
		<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
			<p className='m-0 p-[0.35rem_0.75rem] rounded-full bg-[#edf5ff] text-[#4d458d] text-[0.78rem] font-bold uppercase tracking-[0.08em]'>Reserved section</p>
			<h2 className='m-0 text-[#222]'>{title}</h2>
			<p className='m-0 text-[#666] leading-relaxed'>{description}</p>
			<Link to={backTo} className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#33b5aa] text-white transition-opacity hover:opacity-90'>
				{actionLabel}
			</Link>
		</section>
	)
}



const Dashboard = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course.items)
	const isLoading = useSelector((state) => state.course.isLoading)
	const [isSidebarOpen, setIsSidebarOpen] = useState(true)
	const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
	const [lessonModalMode, setLessonModalMode] = useState('create')
	const [selectedLesson, setSelectedLesson] = useState(null)

	useEffect(() => {
		dispatch(setCoursesFn())
	}, [dispatch])

	const reportLoadError = () => {
		// Errors are now handled centrally in the courseReducer thunks
	}

	const handleAddLesson = () => {
		setLessonModalMode('create')
		setSelectedLesson(null)
		setIsLessonModalOpen(true)
	}

	const handleEditLesson = (lesson) => {
		setLessonModalMode('edit')
		setSelectedLesson(lesson)
		setIsLessonModalOpen(true)
	}

	const handleDeleteLesson = async (lessonId) => {
		if (window.confirm('Are you sure you want to delete this lesson?')) {
			try {
				await deleteLessonService(lessonId)
				dispatch(fetchCourseByIdFn(courseIdMatch))
				dispatch(setNoti('Lesson deleted successfully', 5))
				
				// Navigate away if we're on the deleted lesson page
				if (activeLessonId === String(lessonId)) {
					navigate(`/dashboard/courses/${courseIdMatch}`)
				}
			} catch (error) {
				dispatch(setError(getErrorMessage(error, 'Failed to delete lesson'), 5))
			}
		}
	}

	const handleConfirmLesson = async (title) => {
		try {
			if (lessonModalMode === 'create') {
				await createLesson({ course_id: courseIdMatch, title })
				dispatch(setNoti('Lesson created successfully', 5))
			} else {
				await updateLesson(selectedLesson.lesson_id, { title })
				dispatch(setNoti('Lesson renamed successfully', 5))
			}
			dispatch(fetchCourseByIdFn(courseIdMatch))
			setIsLessonModalOpen(false)
		} catch (error) {
			dispatch(setError(getErrorMessage(error, 'Failed to save lesson'), 5))
		}
	}

	const courseMatch = useMatch('/dashboard/courses/:courseId/*')
	const courseIdMatch = courseMatch?.params?.courseId
	const activeCourse = courses.find((c) => String(c.course_id) === String(courseIdMatch))
	
	const userRole = user?.role || ''
	const isCourseOwner = String(activeCourse?.teacher_id) === String(user?.id)
	const canManageCourse = userRole === 'admin' || (userRole === 'trainer' && isCourseOwner)

	// Lesson match logic for active link inside CourseSidebar
	const lessonMatch = useMatch('/dashboard/courses/:courseId/lessons/:lessonId')
	const activeLessonId = lessonMatch?.params?.lessonId

	return (
		<div className='dashboard-shell flex h-screen overflow-hidden'>
			<Sidebar 
				isOpen={isSidebarOpen} 
				onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
				course={activeCourse} 
				activeLessonId={activeLessonId}
				onAddLesson={canManageCourse ? handleAddLesson : null}
				onEditLesson={canManageCourse ? handleEditLesson : null}
				onDeleteLesson={canManageCourse ? handleDeleteLesson : null}
			/>

			<main className='flex-1 overflow-y-auto relative h-screen w-full p-6 md:p-8 lg:p-10'>
				{!isSidebarOpen && (
					<button
						className="fixed top-4 left-4 z-[50] bg-white border border-[#ecebea] shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer text-[#4d458d] flex items-center justify-center p-[6px] rounded-lg transition-colors hover:bg-[#5f4b96]/10 hover:text-[#5f4b96]"
						onClick={() => setIsSidebarOpen(true)}
						title="Open Sidebar"
					>
						<MenuIcon size={18} />
					</button>
				)}
				<Routes>
					<Route
						index
						element={
							<DashboardHome courses={courses} isLoading={isLoading} user={user} />
						}
					/>
					<Route path='courses/new' element={<CourseForm />} />
					<Route path='courses/:courseId/edit' element={<CourseForm />} />
					<Route
						path='courses/:courseId'
						element={<CourseDetail courses={courses} onError={reportLoadError} />}
					/>
					<Route path='courses/:courseId/lessons/:lessonId' element={<LessonPage />} />
					<Route
						path='announcements'
						element={
							<SectionPlaceholder
								title='Announcements'
								description='This links to announcements page.'
								backTo='/dashboard'
								actionLabel='Back to courses'
							/>
						}
					/>
					<Route
						path='profile'
						element={
							<SectionPlaceholder
								title='Profile'
								description='This links to profile page.'
								backTo='/dashboard'
								actionLabel='Back to courses'
							/>
						}
					/>
					<Route path='*' element={<Navigate replace to='/dashboard' />} />
				</Routes>
			</main>

			<LessonTitleModal 
				isOpen={isLessonModalOpen}
				onClose={() => setIsLessonModalOpen(false)}
				onConfirm={handleConfirmLesson}
				initialTitle={selectedLesson?.title || ''}
				isEdit={lessonModalMode === 'edit'}
			/>
		</div>
	)
}

DashboardHome.propTypes = {
	courses: PropTypes.arrayOf(PropTypes.object).isRequired,
	isLoading: PropTypes.bool.isRequired,
	user: PropTypes.shape({
		email: PropTypes.string,
		first_name: PropTypes.string,
		firstName: PropTypes.string,
		name: PropTypes.string,
	}),
}

CourseDetail.propTypes = {
	courses: PropTypes.arrayOf(PropTypes.object).isRequired,
	onError: PropTypes.func.isRequired,
}

SectionPlaceholder.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	backTo: PropTypes.string.isRequired,
	actionLabel: PropTypes.string.isRequired,
}

export default Dashboard
