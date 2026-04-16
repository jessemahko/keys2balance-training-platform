import { useMemo, useState } from 'react'

import { Link } from 'react-router-dom'
import { normalizeSearchValue } from './dashboardHelpers'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch'
import { Trash2 } from 'lucide-react'
import { deleteCourseFn } from '../../reducers/courseReducer'
import { setError, setNotification } from '../../reducers/notiReducer'

const DashboardHome = () => {
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const [searchTerm, setSearchTerm] = useState('')
	const debouncedSearchTerm = useDebouncedSearch(searchTerm)
	const user = useSelector((state) => state.user)
	const courses = useSelector((state) => state.course.items)
	const isLoading = useSelector((state) => state.course.isLoading)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [courseToDelete, setCourseToDelete] = useState(null)
	const [deleteConfirmText, setDeleteConfirmText] = useState('')
	const [isDeleting, setIsDeleting] = useState(false)
	const normalizedSearchTerm = normalizeSearchValue(debouncedSearchTerm)
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
	const canDeleteCourse = canCreateCourse

	const handleDeleteCourse = async (e, course) => {
		e.preventDefault()
		e.stopPropagation()

		if (!course?.course_id) return

		setCourseToDelete(course)
		setDeleteConfirmText('')
		setIsDeleteModalOpen(true)
	}

	const closeDeleteModal = () => {
		if (isDeleting) return
		setIsDeleteModalOpen(false)
		setCourseToDelete(null)
		setDeleteConfirmText('')
	}

	const confirmDeleteCourse = async (e) => {
		e?.preventDefault?.()
		if (!courseToDelete?.course_id) return

		const expectedTitle = String(courseToDelete.title || '').trim()
		if (!expectedTitle) return

		if (deleteConfirmText.trim() !== expectedTitle) return

		setIsDeleting(true)
		try {
			await dispatch(deleteCourseFn(courseToDelete.course_id))
			dispatch(setNotification(t('Course deleted'), 4))
			closeDeleteModal()
		} catch (err) {
			const message = err?.response?.data?.error || t('Failed to delete course')
			dispatch(setError(message, 5))
		} finally {
			setIsDeleting(false)
		}
	}

	if (isLoading) {
		return (
			<section className='dashboard-panel'>{t('Loading courses...')}</section>
		)
	}

	return (
		<div className='grid gap-[1.35rem] max-w-[1220px] mx-auto min-w-0'>
			{isDeleteModalOpen && courseToDelete ? (
				<div
					className='absolute inset-0 bg-black/50 flex z-[1000] p-5 overflow-auto'
					onMouseDown={(e) => {
						// click outside to close (unless deleting)
						if (e.target === e.currentTarget) closeDeleteModal()
					}}
				>
					<div className='rounded-[18px] m-auto bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.14)] p-[1.3rem] w-full max-w-[560px] min-w-[300px] max-w-full'>
						<div className='flex justify-between items-center mb-4'>
							<h2 className='m-0 text-2xl font-bold text-[#514587]'>
								{t('Delete course')}
							</h2>
							<button
								type='button'
								onClick={closeDeleteModal}
								disabled={isDeleting}
								className={`bg-transparent border-none w-10 h-10 rounded-full text-2xl flex items-center justify-center transition-colors ${
									isDeleting
										? 'text-[#9ca3af] cursor-not-allowed'
										: 'text-[#4f4965] cursor-pointer hover:bg-[#ebe8f5] hover:text-[#514587]'
								}`}
								aria-label={t('Close')}
								title={t('Close')}
							>
								&times;
							</button>
						</div>

						<div className='grid gap-3 text-[#4f4965]'>
							<p className='m-0 leading-relaxed'>
								{t('This will permanently delete the course and its lessons.')}
							</p>
							<p className='m-0 leading-relaxed'>
								{t('To confirm, type the course title exactly:')}
							</p>
							<div className='bg-[#f8f8fb] border border-[#4d458d]/[0.16] rounded-[14px] p-3 font-bold text-[#222]'>
								{courseToDelete.title}
							</div>
						</div>

						<form className='mt-4 grid gap-4' onSubmit={confirmDeleteCourse}>
							<input
								type='text'
								value={deleteConfirmText}
								onChange={(event) => setDeleteConfirmText(event.target.value)}
								disabled={isDeleting}
								className='w-full p-[0.85rem_1rem] border border-[#4d458d]/[0.16] rounded-[14px] bg-[#f8f8fb] text-[#222] focus:outline-none focus:ring-2 focus:ring-[#5f4b96]/20 focus:border-[#5f4b96] transition-all'
								placeholder={t('Type course title to confirm')}
								autoFocus
							/>

							<div className='flex flex-col-reverse sm:flex-row gap-3 sm:justify-end'>
								<button
									type='button'
									onClick={closeDeleteModal}
									disabled={isDeleting}
									className={`inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold border-none transition-opacity ${
										isDeleting
											? 'bg-[#EBE8F5] text-[#9ca3af] cursor-not-allowed opacity-70'
											: 'bg-[#EBE8F5] text-[#4f4965] cursor-pointer hover:opacity-90'
									}`}
								>
									{t('Cancel')}
								</button>
								<button
									type='submit'
									disabled={
										isDeleting ||
										deleteConfirmText.trim() !==
											String(courseToDelete.title || '').trim()
									}
									className={`inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold border-none transition-opacity ${
										isDeleting
											? 'bg-[#514587] text-white cursor-not-allowed opacity-70'
											: deleteConfirmText.trim() ===
													String(courseToDelete.title || '').trim()
												? 'bg-[#514587] text-white cursor-pointer hover:opacity-90'
												: 'bg-[#514587] text-white opacity-50 cursor-not-allowed'
									}`}
								>
									{isDeleting ? t('Deleting...') : t('Confirm delete')}
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			<section className='p-[1rem_0_0.35rem]'>
				<div className='flex justify-between items-center w-full gap-4 flex-wrap'>
					<div>
						<h1 className='m-0 text-[#222]'>{t('Welcome back!')}</h1>
						<p className='m-0 text-[#666] leading-relaxed'>
							{t('Search your assigned courses below.')}
						</p>
					</div>
					{canCreateCourse && (
						<Link
							to='/courses/new'
							className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#33b5aa] text-white transition-opacity hover:opacity-90 whitespace-nowrap'
						>
							{t('Create New Course')}
						</Link>
					)}
				</div>
			</section>

			{courses.length ? (
				<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-[0.85rem]'>
					<div className='grid gap-[0.9rem]'>
						<label className='grid gap-[0.45rem]'>
							<span className='text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#7a7a7a]'>
								{t('Search courses')}
							</span>
							<input
								type='search'
								className='w-full p-[0.85rem_1rem] border border-[#4d458d]/[0.16] rounded-[14px] bg-[#f8f8fb] text-[#222] focus:outline-none focus:ring-2 focus:ring-[#5f4b96]/20 focus:border-[#5f4b96]'
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder={t('Search by course title or description')}
							/>
						</label>
					</div>

					<div className='flex flex-wrap items-center justify-between gap-[0.75rem]'>
						<p className='text-[#666]'>
							{t('Showing {{filtered}} of {{total}} courses', {
								filtered: filteredCourses.length,
								total: courses.length,
							})}
						</p>
						{hasActiveSearch ? (
							<button
								type='button'
								className='border-0 p-0 bg-transparent text-[#4d458d] font-bold cursor-pointer hover:underline'
								onClick={() => setSearchTerm('')}
							>
								{t('Clear search')}
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
							to={`/courses/${course.course_id}`}
							className='grid gap-4 p-5 bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] rounded-[18px] text-inherit transition-all duration-180 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_16px_32px_rgba(90,90,90,0.12)] no-underline'
						>
							<div className='flex items-start justify-between gap-3'>
								<h3 className='m-0 text-[#222]'>{course.title}</h3>
								{canDeleteCourse ? (
									<button
										type='button'
										onClick={(e) => handleDeleteCourse(e, course)}
										className='shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#EBE8F5] text-[#514587] border-none cursor-pointer transition-opacity hover:opacity-90'
										title={t('Delete course')}
										aria-label={t('Delete course')}
									>
										<Trash2 size={18} />
									</button>
								) : null}
							</div>
							<p className='m-0 text-[#666] leading-relaxed'>
								{course.description ||
									t('Open the course overview to access lessons.')}
							</p>
							<div className='flex flex-wrap gap-2 text-[#7a7a7a] text-[0.9rem] font-semibold'>
								<span>
									{Number(course.lesson_count ?? 0)} {t('lessons')}
								</span>
							</div>
							<div className='flex items-center justify-between text-[#27a665] font-bold'>
								<span>{t('View course')}</span>
								<span className='text-2xl leading-none'>&rsaquo;</span>
							</div>
						</Link>
					))}
				</section>
			) : courses.length ? (
				<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
					<h2 className='m-0 text-[#222]'>{t('No matching courses')}</h2>
					<p className='m-0 text-[#666] leading-relaxed'>
						{t('Try another search term or clear the current search.')}
					</p>
				</section>
			) : (
				<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
					<h2 className='m-0 text-[#222]'>{t('No active courses yet')}</h2>
					<p className='m-0 text-[#666] leading-relaxed'>
						{t(
							'Your assigned courses will show here once enrollment is set up.',
						)}
					</p>
				</section>
			)}
		</div>
	)
}

export default DashboardHome
