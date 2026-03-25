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
import './dashboard.css'
import { setCoursesFn, fetchCourseByIdFn } from '../../reducers/courseReducer'
import { setError } from '../../reducers/notiReducer'
import CourseForm from '../courses/CourseForm'
import ParticipantModal from '../courses/ParticipantModal'
import LessonPage from '../courses/LessonPage'
import { useMatch } from 'react-router-dom'
import { createLesson, updateLesson, deleteLesson as deleteLessonService } from '../../services/lessons'
import { setNoti } from '../../reducers/notiReducer'

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
		<div className='dashboard-content-stack'>
			<section className='dashboard-intro'>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem', flexWrap: 'wrap' }}>
					<div>
						<h1>Welcome back!</h1>
						<p>Search your assigned courses below.</p>
					</div>
					{canCreateCourse && (
						<Link to='/dashboard/courses/new' className='dashboard-primary-action' style={{ whiteSpace: 'nowrap' }}>
							Create New Course
						</Link>
					)}
				</div>
			</section>

			{courses.length ? (
				<section className='dashboard-panel dashboard-filter-panel'>
					<div className='dashboard-filter-bar'>
						<label className='dashboard-field dashboard-search-field'>
							<span>Search courses</span>
							<input
								type='search'
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder='Search by course title or description'
							/>
						</label>
					</div>

					<div className='dashboard-filter-summary'>
						<p>
							Showing {filteredCourses.length} of {courses.length} courses
						</p>
						{hasActiveSearch ? (
							<button
								type='button'
								className='dashboard-filter-reset'
								onClick={() => setSearchTerm('')}
							>
								Clear search
							</button>
						) : null}
					</div>
				</section>
			) : null}

			{filteredCourses.length ? (
				<section className='course-grid'>
					{filteredCourses.map((course) => (
						<Link
							key={course.course_id}
							to={`/dashboard/courses/${course.course_id}`}
							className='course-card'
						>
							<div className='course-card-header'>
								<h3>{course.title}</h3>
								<span className='course-card-pill'>Course</span>
							</div>
							<p>
								{course.description ||
									'Open the course overview to access lessons.'}
							</p>
							<div className='course-card-meta'>
								<span>{Number(course.lesson_count ?? 0)} lessons</span>
							</div>
							<div className='course-card-footer'>
								<span>View course</span>
								<span className='course-card-arrow'>&rsaquo;</span>
							</div>
						</Link>
					))}
				</section>
			) : courses.length ? (
				<section className='dashboard-panel dashboard-empty-state'>
					<h2>No matching courses</h2>
					<p>Try another search term or clear the current search.</p>
				</section>
			) : (
				<section className='dashboard-panel dashboard-empty-state'>
					<h2>No active courses yet</h2>
					<p>Your assigned courses will show here once enrollment is set up.</p>
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
	const [isLoading, setIsLoading] = useState(true)
	const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false)
	const user = useSelector((state) => state.user)
	const userRole = user?.role || ''
	const currentUserId = user?.id || ''
	const dispatch = useDispatch()
	const [loadError, setLoadError] = useState('')
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
		let isActive = true

		const loadCourse = async () => {
			setIsLoading(true)
			setLoadError('')

			try {
				await dispatch(fetchCourseByIdFn(courseId))
			} catch (error) {
				if (!isActive) return
				const message = getErrorMessage(error, 'Unable to load the course')
				setLoadError(message)
				onError(message)
			} finally {
				if (isActive) {
					setIsLoading(false)
				}
			}
		}

		loadCourse()

		return () => {
			isActive = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [courseId, dispatch])

	if (isLoading) {
		return <section className='dashboard-panel'>Loading course...</section>
	}

	if (loadError || !course) {
		return (
			<section className='dashboard-panel dashboard-empty-state'>
				<h2>We could not open this course</h2>
				<p>{loadError || 'The requested course does not exist.'}</p>
				<Link to='/dashboard' className='dashboard-primary-action'>
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
		<div className='dashboard-content-stack'>
			<div className='dashboard-page-header'>
				<Link to='/dashboard' className='dashboard-inline-link'>
					Courses
				</Link>
				<h1>{course.title}</h1>
			</div>

			<section className='dashboard-panel'>
				<h2>Welcome to {course.title}</h2>
				<p>
					{course.description ||
						'Access your course contents and track your progress below.'}
				</p>
			</section>

			<section className='dashboard-detail-grid'>
				<article className='dashboard-panel'>
					<h3>Course snapshot</h3>
					<div className='dashboard-course-metrics'>
						<div className='dashboard-metric-box'>
							<span>Total lessons</span>
							<strong>{lessons.length}</strong>
						</div>
						<div className='dashboard-metric-box'>
							<span>Participants</span>
							<strong>{participants.length}</strong>
						</div>
					</div>
					<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: 'column' }}>
						<Link
							to={`/courses/${course.course_id}/discussion`}
							className='dashboard-primary-action'
							style={{ backgroundColor: '#14b8a6', color: '#fff', border: 'none' }}
						>
							Go to discussions
						</Link>
						{canManageCourse && (
							<>
								<Link
									to={`/dashboard/courses/${course.course_id}/edit`}
									className='dashboard-primary-action'
									style={{ backgroundColor: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
								>
									Edit Course
								</Link>
								<button
									onClick={() => setIsParticipantModalOpen(true)}
									className='dashboard-primary-action'
									style={{ backgroundColor: '#0f172a', color: '#fff', border: '1px solid #cbd5e1' }}
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

				<article className='dashboard-panel'>
					<h3>Instructor</h3>
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

				<article className='dashboard-panel dashboard-panel-wide'>
					<div className='dashboard-panel-headline'>
						<div>
							<h3>Lesson preview</h3>
							<p>Quick access to your course lessons.</p>
						</div>
					</div>

					{lessons.length ? (
						<>
							<div className='dashboard-filter-bar'>
								<label className='dashboard-field dashboard-search-field'>
									<span>Search lessons</span>
									<input
										type='search'
										value={lessonSearchTerm}
										onChange={(event) =>
											setLessonSearchTerm(event.target.value)
										}
										placeholder='Search by lesson title or number'
									/>
								</label>
							</div>

							<div className='dashboard-filter-summary'>
								<p>
									Showing {filteredLessons.length} of {lessons.length} lessons
								</p>
								{hasActiveLessonSearch ? (
									<button
										type='button'
										className='dashboard-filter-reset'
										onClick={() => setLessonSearchTerm('')}
									>
										Clear search
									</button>
								) : null}
							</div>
						</>
					) : null}

					{filteredLessons.length ? (
						<div className='course-lesson-preview-list'>
							{filteredLessons.map((lesson, index) => {
								const lessonStatus = getLessonStatus(lesson)
								const lessonNumber = Number(lesson.order_index ?? index + 1)

								return (
									<Link
										key={lesson.lesson_id}
										to={`/dashboard/courses/${course.course_id}/lessons/${lesson.lesson_id}`}
										className='course-lesson-preview-item'
										style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
									>
										<span className='course-lesson-index'>{lessonNumber}</span>
										<div style={{ flex: 1 }}>
											<strong>{lesson.title}</strong>
											<p>
												{lessonStatus === LESSON_FILTERS.ready
													? 'Ready to view'
													: 'Outline only'}
											</p>
										</div>
										<span
											className={`course-lesson-status course-lesson-status-${lessonStatus}`}
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
		<section className='dashboard-panel dashboard-empty-state dashboard-placeholder-page'>
			<p className='dashboard-placeholder-tag'>Reserved section</p>
			<h2>{title}</h2>
			<p>{description}</p>
			<Link to={backTo} className='dashboard-primary-action'>
				{actionLabel}
			</Link>
		</section>
	)
}



const Dashboard = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course)
	const [isLoading, setIsLoading] = useState(true)
	const [isSidebarOpen, setIsSidebarOpen] = useState(true)
	const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
	const [lessonModalMode, setLessonModalMode] = useState('create')
	const [selectedLesson, setSelectedLesson] = useState(null)

	useEffect(() => {
		let isActive = true

		const loadCourses = async () => {
			setIsLoading(true)

			try {
				await dispatch(setCoursesFn())
			} catch (error) {
				dispatch(
					setError(getErrorMessage(error, 'Unable to load your courses'), 5),
				)
			} finally {
				if (isActive) {
					setIsLoading(false)
				}
			}
		}

		loadCourses()

		return () => {
			isActive = false
		}
	}, [dispatch])

	const reportLoadError = (message) => {
		dispatch(setError(message, 5))
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

			<main className='dashboard-main flex-1 overflow-y-auto relative h-screen w-full'>
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
					<Route path='courses/:courseId/lessons/:lessonId' element={<LessonPage isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />} />
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
