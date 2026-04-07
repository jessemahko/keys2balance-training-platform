import {
	Route,
	useParams,
	Routes,
	Navigate,
	useNavigate,
	Link,
} from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMemo, useState, useEffect } from 'react'
import LessonPage from './LessonPage'
import CourseLabel from '../dashboard/CourseLabel'
import QuizEditor from '../assessments/QuizEditor'
import QuizTake from '../assessments/QuizTake'
import QuizResults from '../assessments/QuizResults'
import DiscussionPage from './DiscussionPage'
import CourseForm from './CourseForm'

import { useDispatch } from 'react-redux'
import { fetchCourseByIdFn } from '../../reducers/courseReducer'
import SectionPlaceholder from '../dashboard/SectionPlaceholder'
import { useTranslation } from 'react-i18next'

const CourseRoutes = () => {
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const { courseId } = useParams()
	const courses = useSelector((state) => state.course.items)
	const isLoading = useSelector((state) => state.course.isLoading)
	const loadError = useSelector((state) => state.course.error)
	const course = useMemo(
		() =>
			courses.find((course) => String(course.course_id) === String(courseId)),
		[courses, courseId],
	)

	useEffect(() => {
		dispatch(fetchCourseByIdFn(courseId))
	}, [courseId])

	if (isLoading) {
		return (
			<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4'>
				{t('Loading course...')}
			</section>
		)
	}

	if (loadError || !course) {
		return (
			<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
				<h2 className='m-0 text-[#222]'>
					{t('We could not open this course')}
				</h2>
				<p className='m-0 text-[#666] leading-relaxed'>
					{loadError ||
						t(
							'The requested course does not exist or you do not have access to it.',
						)}
				</p>
				<Link
					to='/dashboard'
					className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#33b5aa] text-white transition-opacity hover:opacity-90'
				>
					{t('Back to courses')}
				</Link>
			</section>
		)
	}

	return (
		<Routes>
			<Route path='edit' element={<CourseForm />} />
			<Route path='' element={<CourseLabel />} />
			<Route path='lessons/:lessonId' element={<LessonPage />} />
			<Route path='lessons/:lessonId/quiz/new' element={<QuizEditor />} />
			<Route
				path='lessons/:lessonId/quiz/:assessmentId/edit'
				element={<QuizEditor />}
			/>
			<Route
				path='lessons/:lessonId/quiz/:assessmentId'
				element={<QuizTake />}
			/>
			<Route
				path='lessons/:lessonId/quiz/:assessmentId/results'
				element={<QuizResults />}
			/>
			<Route path='discussion' element={<DiscussionPage />} />
			<Route
				path='*'
				element={<Navigate replace to={`/courses/${courseId}`} />}
			/>
		</Routes>
	)
}

export default CourseRoutes
