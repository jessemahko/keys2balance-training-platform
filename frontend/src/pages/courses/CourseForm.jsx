import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setError } from '../../reducers/notiReducer'
import {
	createCourseFn,
	updateCourseFn,
	fetchCourseByIdFn,
} from '../../reducers/courseReducer'
import { setUsersFn } from '../../reducers/usersReducer'
import { useTranslation } from 'react-i18next'
import { styles } from '../style.js'

const CourseForm = () => {
	const { courseId } = useParams()
	const { t } = useTranslation()
	const isEditMode = Boolean(courseId)
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const users = useSelector((state) => state.users) || []
	const courseState = useSelector((state) => state.course)
	const courses = courseState?.items || []
	const courseToEdit = courses.find(
		(c) => String(c.course_id) === String(courseId),
	)

	const currentUserId = user?.id || ''
	const userRole = user?.role || ''
	const requestedCourseIdRef = useRef(null)

	// Role guard: only admins and trainers can create/edit courses
	const isCourseOwner =
		isEditMode && courseToEdit
			? String(courseToEdit.teacher_id) === String(currentUserId)
			: true
	const canAccessForm =
		userRole === 'admin' || (userRole === 'trainer' && isCourseOwner)

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		teacherId: currentUserId,
	})
	const [loading, setLoading] = useState(true)

	// If we're creating a course, there's nothing to fetch.
	useEffect(() => {
		if (!isEditMode) {
			setLoading(false)
		}
	}, [isEditMode])

	useEffect(() => {
		if (userRole === 'admin') {
			dispatch(setUsersFn())
		}
	}, [userRole, dispatch])

	const trainers = useMemo(() => {
		if (!users.length)
			return [{ user_id: currentUserId, username: t('Me (Admin)') }]
		const fetchedTrainers = users.filter((u) => u.role === 'trainer')
		return [
			{ user_id: currentUserId, username: t('Me (Admin)') },
			...fetchedTrainers,
		]
	}, [users, currentUserId, t])

	// In edit mode, ensure the course detail is loaded once.
	useEffect(() => {
		if (!isEditMode || !courseId) return
		if (courseToEdit) return

		if (requestedCourseIdRef.current === courseId) return
		requestedCourseIdRef.current = courseId

		dispatch(fetchCourseByIdFn(courseId))
	}, [dispatch, isEditMode, courseId, courseToEdit])

	useEffect(() => {
		if (isEditMode && courseToEdit) {
			setFormData({
				title: courseToEdit.title,
				description: courseToEdit.description || '',
				teacherId: courseToEdit.teacher_id,
			})
			setLoading(false)
		}
	}, [courseToEdit, isEditMode])

	// If the course fetch fails in edit mode, stop the spinner and show error.
	useEffect(() => {
		if (!isEditMode) return
		if (!courseId) return
		if (courseToEdit) return

		if (courseState?.error) {
			dispatch(setError(courseState.error))
			setLoading(false)
		}
	}, [isEditMode, courseId, courseToEdit, courseState?.error])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			if (isEditMode) {
				await dispatch(updateCourseFn(courseId, formData))
			} else {
				await dispatch(createCourseFn(formData))
			}
			navigate('/dashboard')
		} catch (e) {
			dispatch(setError(e.response?.data?.error || t('Operation failed')))
		}
	}

	if (!canAccessForm) {
		return <Navigate replace to='/dashboard' />
	}

	if (loading)
		return (
			<div style={styles.loadingContainer}>
				<div style={styles.loadingSpinner}></div>
				<p style={styles.loadingText}>{t('Loading...')}</p>
			</div>
		)

	return (
		<div className='p-4 sm:p-8 max-w-2xl mx-auto w-full min-w-[300px] max-w-full'>
			<div className='bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-[#cdd0d8] w-full min-w-[300px] max-w-full'>
				<h1 className='text-3xl font-bold text-[#514587] mb-6'>
					{isEditMode ? t('Edit Course') : t('Create New Course')}
				</h1>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block text-sm font-bold text-[#514587] mb-2 uppercase tracking-tight'>
							{t('Course Title')}
						</label>
						<input
							type='text'
							name='title'
							value={formData.title}
							onChange={handleChange}
							required
							className='w-full border border-[#cdd0d8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#514587] transition'
							placeholder={t('e.g., Intro to Leadership')}
						/>
					</div>

					<div>
						<label className='block text-sm font-bold text-[#514587] mb-2 uppercase tracking-tight'>
							{t('Description')}
						</label>
						<textarea
							name='description'
							value={formData.description}
							onChange={handleChange}
							rows='5'
							className='w-full border border-[#cdd0d8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#514587] transition'
							placeholder={t('Describe what students will learn...')}
						></textarea>
					</div>

					{userRole === 'admin' && (
						<div>
							<label className='block text-sm font-bold text-[#514587] mb-2 uppercase tracking-tight'>
								{t('Assign Instructor')}
							</label>
							<select
								name='teacherId'
								value={formData.teacherId}
								onChange={handleChange}
								className='w-full border border-[#cdd0d8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#514587] transition bg-white'
							>
								{trainers.map((t) => (
									<option key={t.user_id} value={t.user_id}>
										{t.first_name || t.username} {t.last_name || ''}
									</option>
								))}
							</select>
						</div>
					)}

					<div className='flex flex-col sm:flex-row gap-4 pt-4'>
						<button
							type='submit'
							className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#514587] text-white border-none transition-opacity hover:opacity-90 flex-1'
						>
							{isEditMode ? t('Update Course') : t('Create Course')}
						</button>
						<button
							type='button'
							onClick={() => navigate(-1)}
							className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#EBE8F5] text-[#4f4965] border-none transition-opacity hover:opacity-90 flex-1'
						>
							{t('Cancel')}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CourseForm
