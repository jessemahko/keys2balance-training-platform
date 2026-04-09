import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar/Sidebar'
import LessonTitleModal from '../../components/Sidebar/LessonTitleModal'
import { setCoursesFn, fetchCourseByIdFn } from '../../reducers/courseReducer'
import { setNoti, setError } from '../../reducers/notiReducer'
import {
	createLesson,
	updateLesson,
	deleteLesson as deleteLessonService,
} from '../../services/lessons'
import { getErrorMessage } from './dashboardHelpers'
import { useMatch } from 'react-router-dom'

import CourseForm from '../courses/CourseForm'
import DashboardHome from './DashboardHome'
import ProfilePage from '../profile/ProfilePage'
import OtherProfile from '../profile/OtherProfile'

import CourseRoutes from '../courses/CourseRoutes'

import AnnoucementPage from '../announcement/Announcement'
import ManageTrainers from './ManageTrainers'

import { useTranslation } from 'react-i18next'

const Dashboard = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course.items)

	const [isSidebarOpen, setIsSidebarOpen] = useState(true)
	const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
	const [lessonModalMode, setLessonModalMode] = useState('create')
	const [selectedLesson, setSelectedLesson] = useState(null)

	useEffect(() => {
		dispatch(setCoursesFn())
	}, [dispatch])

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
		if (window.confirm(t('Are you sure you want to delete this lesson?'))) {
			try {
				await deleteLessonService(lessonId)
				dispatch(fetchCourseByIdFn(courseIdMatch))
				dispatch(setNoti('Lesson deleted successfully', 5))

				// Navigate away if we're on the deleted lesson page
				if (activeLessonId === String(lessonId)) {
					navigate(`/courses/${courseIdMatch}`)
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

	const courseMatch = useMatch('/courses/:courseId/*')
	const courseIdMatch = courseMatch?.params?.courseId
	const activeCourse = courses.find(
		(c) => String(c.course_id) === String(courseIdMatch),
	)

	const userRole = user?.role || ''
	const isCourseOwner = String(activeCourse?.teacher_id) === String(user?.id)
	const canManageCourse =
		userRole === 'admin' || (userRole === 'trainer' && isCourseOwner)

	// Lesson match logic for active link inside CourseSidebar
	const lessonMatch = useMatch('/courses/:courseId/lessons/:lessonId')
	const activeLessonId = lessonMatch?.params?.lessonId

	// Check if we are precisely on the discussion page to remove layout padding
	const discussionMatch = useMatch('/courses/:courseId/discussion')
	const isDiscussionPage = !!discussionMatch

	return (
		<div className='dashboard-shell flex h-screen overflow-hidden'>
			<Sidebar
				isOpen={isSidebarOpen}
				onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
				onAddLesson={canManageCourse ? handleAddLesson : null}
				onEditLesson={canManageCourse ? handleEditLesson : null}
				onDeleteLesson={canManageCourse ? handleDeleteLesson : null}
			/>

			<main
				className={`flex-1 overflow-y-auto relative h-screen w-full ${isDiscussionPage ? '' : 'p-6 md:p-8 lg:p-10'}`}
			>
				<Routes>
					<Route path='/dashboard' element={<DashboardHome />} />
					<Route path='courses/new' element={<CourseForm />} />
					<Route path='courses/:courseId/*' element={<CourseRoutes />} />
					<Route path='announcements' element={<AnnoucementPage />} />
					<Route path='profile' element={<ProfilePage />} />
					<Route
						path='manage-trainers'
						element={
							userRole === 'admin' ? (
								<ManageTrainers />
							) : (
								<Navigate replace to='/dashboard' />
							)
						}
					/>

					<Route path='/profile/:userId' element={<OtherProfile />} />

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

export default Dashboard
