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
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import './dashboard.css'
import { setCoursesFn } from '../../reducers/courseReducer'
import { setError } from '../../reducers/notiReducer'
import { getCourseById } from '../../services/courses'
import CourseForm from '../courses/CourseForm'

const navigationItems = [
	{
		label: 'Courses',
		to: '/dashboard',
		icon: DashboardRoundedIcon,
	},
	{
		label: 'Announcements',
		to: '/dashboard/announcements',
		icon: CampaignRoundedIcon,
	},
	{
		label: 'Discussion',
		to: '/dashboard/discussion',
		icon: Groups2RoundedIcon,
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

const DashboardNav = () => {
	return (
		<header className='dashboard-topbar'>
			<Link to='/dashboard' className='dashboard-brand'>
				<div className='dashboard-brand-mark'>
					<span>K</span>
					<span>2</span>
					<span>B</span>
				</div>
				<div>
					<p className='dashboard-brand-label'>Keys 2 Balance</p>
					<span className='dashboard-brand-subtitle'>Participant portal</span>
				</div>
			</Link>

			<nav className='dashboard-nav' aria-label='Dashboard sections'>
				{navigationItems.map((item) => {
					const Icon = item.icon

					return (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.to === '/dashboard'}
							className={({ isActive }) =>
								`dashboard-nav-link ${isActive ? 'dashboard-nav-link-active' : ''}`
							}
						>
							<Icon fontSize='small' />
							<span>{item.label}</span>
						</NavLink>
					)
				})}
			</nav>
		</header>
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
					<Link to='/dashboard/courses/new' className='dashboard-primary-action' style={{ whiteSpace: 'nowrap' }}>
						Create New Course
					</Link>
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
							to={`/dashboard/courses/${course.course_id}/lessons`}
							className='dashboard-primary-action'
						>
							Go to lessons page
						</Link>
						<Link
							to={`/dashboard/courses/${course.course_id}/edit`}
							className='dashboard-primary-action'
							style={{ backgroundColor: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }}
						>
							Edit Course
						</Link>
					</div>
				</article>

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
		<div className='dashboard-shell'>
			<DashboardNav />

			<main className='dashboard-main'>
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
						path='discussion'
						element={
							<SectionPlaceholder
								title='Discussion'
								description='This links to discussion page.'
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
