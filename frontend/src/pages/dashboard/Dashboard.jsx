import { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './dashboard.css'
import { useDispatch, useSelector } from 'react-redux'
import { setCoursesFn } from '../../reducers/courseReducer'

//     /dashboard/abc/123

//    /dashboard/abc/asodiuvhdosfuv -> /dashboard/

const Dashboard = () => {
	const { t, i18n } = useTranslation()
	const dispatch = useDispatch()
	const courses = useSelector((state) => state.course)

	// useEffect(() => {
	// 	dispatch(setCoursesFn())
	// }, [])
	// console.log(courses)

	// const courses = [
	// 	{
	// 		id: 1,
	// 		name: 'Course 1',
	// 		description: 'Description for Course 1',
	// 	},
	// 	{
	// 		id: 2,
	// 		name: 'Course 2',
	// 		description: 'Description for Course 2',
	// 	},
	// ]
	return (
		<div>
			<h1>{t('Dashboard')}</h1>
			{/* <div className='bg-black text-white'>
				<h1>{t('Hello')}</h1>
			</div> */}
			{/* {courses.map((course) => (
				<div key={course.id} className='course-card'>
					<h2>{course.name}</h2>
					<p>{course.description}</p>
				</div>
			))} */}
			{/* <Routes>
				<Route path='/' element={<h1>Dashboard Home</h1>} />
				<Route path='/abc' element={<h1>ABC Page</h1>} />
				<Route path='/123' element={<h1>123 Page</h1>} />
				<Route path='*' element={<Navigate replace to='/' />} />
			</Routes> */}
		</div>
	)
}

export default Dashboard
