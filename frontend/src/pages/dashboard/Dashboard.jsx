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
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import './dashboard.css'
import { setCoursesFn } from '../../reducers/courseReducer'
import { setError } from '../../reducers/notiReducer'
import { getCourseById } from '../../services/courses'
import CourseForm from '../courses/CourseForm'
import ParticipantModal from '../courses/ParticipantModal'

const navigationItems = [
	{
		label: 'Announcements',
		to: '/dashboard/announcements',
		icon: CampaignRoundedIcon,
	},
	{
		label: 'Profile',
		to: '/dashboard/profile',
		icon: PersonOutlineRoundedIcon,
	},
]

const MODULE_FILTERS = {
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
	return getLessonContentCount(lesson) > 0 ? MODULE_FILTERS.ready : MODULE_FILTERS.draft
}

const DashboardSidebar = ({ isOpen, onToggle }) => {
	const navLinkClass = "flex items-center px-4 py-3 text-gray-800 transition-colors font-medium rounded-lg hover:bg-[#5f4b96]/10 hover:text-[#5f4b96]"
	const activeNavLinkClass = "bg-[#5f4b96] text-white shadow-[0_4px_10px_rgba(81,69,135,0.2)] hover:bg-[#5f4b96] hover:text-white"

	return (
		<>
			{/* Mobile/Overlay backdrop when open */}
			{isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] md:hidden transition-opacity" onClick={onToggle}></div>}
			
			<aside className={`bg-white border-r border-[#ecebea] flex flex-col py-6 shrink-0 z-[100] transition-all duration-300 ease-in-out h-full overflow-hidden ${isOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full border-r-0'}`}>
				<div className={`px-6 pb-0 border-b border-[#ecebea] mb-4 w-[280px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
					<div className="flex justify-between items-center mb-4 w-full">
						<Link to='/dashboard' className='flex items-center gap-3 transition-transform hover:scale-[1.02] mb-2 dashboard-brand text-[#5f4b96]'>
							<div className='dashboard-brand-mark' style={{ borderColor: '#5f4b96', color: '#5f4b96' }}>
								<span>K</span>
								<span>2</span>
								<span>B</span>
							</div>
							<div>
								<p className='dashboard-brand-label' style={{ color: '#5f4b96' }}>Keys 2 Balance</p>
								<span className='dashboard-brand-subtitle' style={{ color: '#7a7a7a' }}>Participant portal</span>
							</div>
						</Link>
						<button 
							className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center p-1 rounded transition hover:bg-[#5f4b96]/10 hover:text-[#5f4b96]" 
							onClick={onToggle}
							title="Close Sidebar"
						>
							<ChevronLeftRoundedIcon fontSize='small' />
						</button>
					</div>
				</div>

				<nav className="flex-1 overflow-y-auto overflow-x-hidden">
					<div className="px-6 pb-3 text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold w-[280px]">Menu</div>
					<ul className="list-none px-4 w-[280px] mb-6 flex flex-col gap-1">
						{navigationItems.map((item) => {
							const Icon = item.icon
							return (
								<li key={item.to} className="rounded-lg w-full">
									<NavLink
										to={item.to}
										end={item.to === '/dashboard'}
										className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
									>
										<span className="mr-3 flex items-center"><Icon fontSize='small' /></span>
										<span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
									</NavLink>
								</li>
							)
						})}
					</ul>
				</nav>
			</aside>
		</>
	)
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

	const decodedToken = user?.token ? JSON.parse(atob(user.token.split('.')[1])) : null
	const userRole = decodedToken?.role || user?.role || ''
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
								<span>{Number(course.lesson_count ?? 0)} modules</span>
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
		() => courses.find((course) => course.course_id === courseId) || null,
		[courses, courseId],
	)
	const [course, setCourse] = useState(cachedCourse)
	const [isLoading, setIsLoading] = useState(!cachedCourse)
	const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false)
	const user = useSelector((state) => state.user)
	const decodedToken = user?.token ? JSON.parse(atob(user.token.split('.')[1])) : null
	const userRole = decodedToken?.role || user?.role || ''
	const currentUserId = decodedToken?.id || user?.id || ''
	const [loadError, setLoadError] = useState('')
	const [moduleSearchTerm, setModuleSearchTerm] = useState('')
	const deferredModuleSearchTerm = useDeferredValue(moduleSearchTerm)
	const lessons = useMemo(() => sortLessons(course?.lessons), [course])
	const normalizedModuleSearchTerm = normalizeSearchValue(
		deferredModuleSearchTerm,
	)
	const filteredLessons = useMemo(() => {
		return lessons.filter((lesson) => {
			return (
				!normalizedModuleSearchTerm ||
				`${lesson.title ?? ''} ${lesson.order_index ?? ''}`
					.toLowerCase()
					.includes(normalizedModuleSearchTerm)
			)
		})
	}, [lessons, normalizedModuleSearchTerm])
	const hasActiveModuleSearch = moduleSearchTerm.trim().length > 0

	useEffect(() => {
		let isActive = true

		const loadCourse = async () => {
			setIsLoading(true)
			setLoadError('')

			try {
				const nextCourse = await getCourseById(courseId)
				if (!isActive) return
				setCourse(nextCourse)
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
	}, [courseId, onError])

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
			const nextCourse = await getCourseById(courseId)
			setCourse(nextCourse)
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
						'This links to lesson page.'}
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
							Go to discussion page
						</Link>
						<Link
							to={`/dashboard/courses/${course.course_id}/lessons`}
							className='dashboard-primary-action'
						>
							Go to lessons page
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
					<p>
						Instructor profile details are not exposed in this course endpoint yet.
						This slot is reserved for the profile/instructor workstream.
					</p>
				</article>

				<article className='dashboard-panel dashboard-panel-wide'>
					<div className='dashboard-panel-headline'>
						<div>
							<h3>Module preview</h3>
							<p>Search the modules in this course.</p>
						</div>
						<Link
							to={`/dashboard/courses/${course.course_id}/lessons`}
							className='dashboard-inline-link'
						>
							Open lessons
						</Link>
					</div>

					{lessons.length ? (
						<>
							<div className='dashboard-filter-bar'>
								<label className='dashboard-field dashboard-search-field'>
									<span>Search modules</span>
									<input
										type='search'
										value={moduleSearchTerm}
										onChange={(event) =>
											setModuleSearchTerm(event.target.value)
										}
										placeholder='Search by module title or number'
									/>
								</label>
							</div>

							<div className='dashboard-filter-summary'>
								<p>
									Showing {filteredLessons.length} of {lessons.length} modules
								</p>
								{hasActiveModuleSearch ? (
									<button
										type='button'
										className='dashboard-filter-reset'
										onClick={() => setModuleSearchTerm('')}
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
									<div
										key={lesson.lesson_id}
										className='course-lesson-preview-item'
									>
										<span className='course-lesson-index'>{lessonNumber}</span>
										<div>
											<strong>{lesson.title}</strong>
											<p>
												{lessonStatus === MODULE_FILTERS.ready
													? 'Ready for study from the lessons page.'
													: 'Outline added. Content blocks are still empty.'}
											</p>
										</div>
										<span
											className={`course-lesson-status course-lesson-status-${lessonStatus}`}
										>
											{lessonStatus === MODULE_FILTERS.ready
												? 'Ready'
												: 'Outline'}
										</span>
									</div>
								)
							})}
						</div>
					) : lessons.length ? (
						<p>No modules match the current search.</p>
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

const LessonsPlaceholder = () => {
	const { courseId } = useParams()

	return (
		<SectionPlaceholder
			title='Lessons Page'
			description='This links to lessons page.'
			backTo={`/dashboard/courses/${courseId}`}
			actionLabel='Back to course overview'
		/>
	)
}

const Dashboard = () => {
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course)
	const [isLoading, setIsLoading] = useState(true)
	const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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

	return (
		<div className='dashboard-shell flex h-screen overflow-hidden'>
			<DashboardSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

			<main className='dashboard-main flex-1 overflow-y-auto relative h-screen w-full'>
				{!isSidebarOpen && (
					<button
						className="fixed top-4 left-4 z-[50] bg-white border border-[#ecebea] shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer text-[#4d458d] flex items-center justify-center p-[6px] rounded-lg transition-colors hover:bg-[#5f4b96]/10 hover:text-[#5f4b96]"
						onClick={() => setIsSidebarOpen(true)}
						title="Open Sidebar"
					>
						<MenuRoundedIcon fontSize='small' />
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
					<Route path='courses/:courseId/lessons' element={<LessonsPlaceholder />} />
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
