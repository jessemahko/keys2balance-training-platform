import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createCourseFn, updateCourseFn, fetchCourseByIdFn } from '../../reducers/courseReducer'
import { setUsersFn } from '../../reducers/usersReducer'

const CourseForm = () => {
	const { courseId } = useParams()
	const isEditMode = Boolean(courseId)
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const user = useSelector((state) => state.user)
	const users = useSelector((state) => state.users) || []
	const courses = useSelector((state) => state.course.items) || []
	const courseToEdit = courses.find((c) => String(c.course_id) === String(courseId))

	const currentUserId = user?.id || ''
	const userRole = user?.role || ''

	const [formData, setFormData] = useState({
		title: '',
		description: '',
		thumbnailUrl: '',
		teacherId: currentUserId,
	})
	const [loading, setLoading] = useState(isEditMode)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (userRole === 'admin') {
			dispatch(setUsersFn())
		}
	}, [userRole, dispatch])

	const trainers = useMemo(() => {
		if (!users.length) return [{ user_id: currentUserId, username: 'Me (Admin)' }]
		const fetchedTrainers = users.filter(u => u.role === 'trainer')
		return [{ user_id: currentUserId, username: 'Me (Admin)' }, ...fetchedTrainers]
	}, [users, currentUserId])

	useEffect(() => {
		if (isEditMode) {
			const fetchCourse = async () => {
				try {
					await dispatch(fetchCourseByIdFn(courseId))
				} catch (err) {
					console.error(err)
					setError('Failed to fetch course details')
					setLoading(false)
				}
			}
			fetchCourse()
		}
	}, [courseId, isEditMode, dispatch])

	useEffect(() => {
		if (isEditMode && courseToEdit) {
			setFormData({
				title: courseToEdit.title,
				description: courseToEdit.description || '',
				thumbnailUrl: courseToEdit.thumbnail_url || '',
				teacherId: courseToEdit.teacher_id,
			})
			setLoading(false)
		}
	}, [courseToEdit, isEditMode])

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
			setError(e.response?.data?.error || 'Operation failed')
		}
	}

	if (loading) return <div className='p-8 text-center'>Loading...</div>

	return (
		<div className='p-8 max-w-2xl mx-auto'>
			<div className='bg-white rounded-xl shadow-lg p-8 border border-[#cdd0d8]'>
				<h1 className='text-3xl font-bold text-[#514587] mb-6'>
					{isEditMode ? 'Edit Course' : 'Create New Course'}
				</h1>

				{error && (
					<div className='bg-red-100 text-red-700 p-4 rounded-lg mb-6'>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block text-sm font-bold text-[#514587] mb-2 uppercase tracking-tight'>
							Course Title
						</label>
						<input
							type='text'
							name='title'
							value={formData.title}
							onChange={handleChange}
							required
							className='w-full border border-[#cdd0d8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#514587] transition'
							placeholder='e.g., Intro to Leadership'
						/>
					</div>

					<div>
						<label className='block text-sm font-bold text-[#514587] mb-2 uppercase tracking-tight'>
							Description
						</label>
						<textarea
							name='description'
							value={formData.description}
							onChange={handleChange}
							rows='5'
							className='w-full border border-[#cdd0d8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#514587] transition'
							placeholder='Describe what students will learn...'
						></textarea>
					</div>

					{userRole === 'admin' && (
						<div>
							<label className='block text-sm font-bold text-[#514587] mb-2 uppercase tracking-tight'>
								Assign Instructor
							</label>
							<select
								name='teacherId'
								value={formData.teacherId}
								onChange={handleChange}
								className='w-full border border-[#cdd0d8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#514587] transition bg-white'
							>
								{trainers.map(t => (
									<option key={t.user_id} value={t.user_id}>
										{t.first_name || t.username} {t.last_name || ''}
									</option>
								))}
							</select>
						</div>
					)}

					<div>
						<label className='block text-sm font-bold text-[#514587] mb-2 uppercase tracking-tight'>
							Thumbnail URL
						</label>
						<input
							type='url'
							name='thumbnailUrl'
							value={formData.thumbnailUrl}
							onChange={handleChange}
							className='w-full border border-[#cdd0d8] rounded-lg px-4 py-3 focus:outline-none focus:border-[#514587] transition'
							placeholder='https://example.com/image.jpg'
						/>
					</div>

					<div className='flex gap-4 pt-4'>
						<button
							type='submit'
							className='flex-grow bg-[#514587] text-white py-3 rounded-lg font-bold hover:bg-[#9484b4] transition shadow-md'
						>
							{isEditMode ? 'Update Course' : 'Create Course'}
						</button>
						<button
							type='button'
							onClick={() => navigate(-1)}
							className='px-8 py-3 border-2 border-[#cdd0d8] text-[#9484b4] rounded-lg font-bold hover:bg-[#ededed] transition'
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CourseForm
