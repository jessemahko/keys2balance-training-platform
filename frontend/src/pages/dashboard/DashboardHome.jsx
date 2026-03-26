import { useDeferredValue, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { normalizeSearchValue } from './dashboardHelpers'

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

export default DashboardHome
