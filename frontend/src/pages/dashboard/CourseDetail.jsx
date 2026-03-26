import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourseByIdFn } from '../../reducers/courseReducer'
import ParticipantModal from '../courses/ParticipantModal'
import { sortLessons, normalizeSearchValue, getLessonStatus, LESSON_FILTERS } from './dashboardHelpers'

const CourseDetail = ({ courses }) => {
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

CourseDetail.propTypes = {
	courses: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default CourseDetail
