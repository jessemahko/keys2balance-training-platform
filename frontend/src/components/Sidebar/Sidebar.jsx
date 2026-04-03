import React, { useState, useEffect, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
	Megaphone,
	User,
	BookOpen,
	Play,
	MessageSquare,
	Settings,
	ChevronLeft,
	PlusCircle,
	Edit2,
	Trash2,
	MoreVertical,
} from 'lucide-react'
import logo from '../../assets/k2b-logo-purple.svg'

import { useTranslation } from 'react-i18next'

import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LogoutIcon from '@mui/icons-material/Logout'
import { Menu as MenuIcon } from 'lucide-react'

import EnFlag from '../../assets/flags/en.png'
import SvFlag from '../../assets/flags/sv.png'
import FiFlag from '../../assets/flags/fi.png'

import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { rmUserFn } from '../../reducers/userReducer'

const Sidebar = ({
	isOpen,
	onToggle,
	course = null,
	activeLessonId = null,
	onAddLesson,
	onEditLesson,
	onDeleteLesson,
}) => {
	const [activeDropdownLessonId, setActiveDropdownLessonId] = useState(null)
	const { t, i18n } = useTranslation()
	const dropdownRef = useRef(null)
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [currentLanguage, setCurrentLanguage] = useState(
		localStorage.getItem('language') || 'en',
	)
	const [isHoverLanguage, setIsHoverLanguage] = useState(false)
	const [languageHovered, setLanguageHovered] = useState(null)

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				!event.target.closest('.lesson-more-btn')
			) {
				setActiveDropdownLessonId(null)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const toggleDropdown = (e, lessonId) => {
		e.stopPropagation()
		e.preventDefault()
		setActiveDropdownLessonId((prev) => (prev === lessonId ? null : lessonId))
	}

	const navLinkClass =
		'flex items-center px-4 py-3 text-gray-800 transition-colors font-medium rounded-lg hover:bg-[#514587]/10 hover:text-[#514587]'
	const activeNavLinkClass =
		'bg-[#514587] text-white shadow-[0_4px_10px_rgba(81,69,135,0.2)] hover:bg-[#514587] hover:text-white'

	const logoutButtonStyle =
		'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 mt-5 relative after:absolute after:top-0 after:left-0 after:w-full after:h-px after:bg-gray-300 after:content-[""]'

	const lessons = course
		? [...(course.lessons || [])].sort(
				(a, b) => Number(a.order_index ?? 0) - Number(b.order_index ?? 0),
			)
		: []

	const handleLogout = () => {
		// Logout logic
		window.localStorage.removeItem('loggedUser') // Remove user from localStorage
		dispatch(rmUserFn()) // Dispatch action to remove user from Redux
		navigate('/authentication')
	}
	return (
		<>
			{isOpen && (
				<div
					className='fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] md:hidden transition-opacity duration-300'
					onClick={onToggle}
				></div>
			)}

			<aside
				className={`bg-white border-r border-[#ecebea] flex flex-col py-6 shrink-0 z-[100] transition-all duration-300 ease-in-out h-full overflow-hidden ${isOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full border-r-0'}`}
			>
				{/* Brand Header */}
				<div
					className={`px-6 pb-0 border-b border-[#ecebea] mb-4 w-[280px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
				>
					<div className='flex justify-between items-center mb-4 w-full'>
						<Link
							to='/dashboard'
							className='block transition-transform hover:scale-[1.02] mb-2 dashboard-brand text-[#514587]'
						>
							<div className='flex items-center gap-3'>
								<img
									src={logo}
									alt='K2B Logo'
									className='w-10 h-10 object-contain'
								/>
								<div>
									<p
										className='dashboard-brand-label'
										style={{ color: '#514587', fontSize: '14px' }}
									>
										Keys 2 Balance
									</p>
									<span
										className='dashboard-brand-subtitle'
										style={{ color: '#7a7a7a', fontSize: '10px' }}
									>
										{t('Participant portal')}
									</span>
								</div>
							</div>
						</Link>
						<button
							className='bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center p-1 rounded transition hover:bg-[#514587]/10 hover:text-[#514587]'
							onClick={onToggle}
							title={t('Close Sidebar')}
						>
							<ChevronLeft size={18} />
						</button>
					</div>
				</div>

				<nav className='flex-1 overflow-y-auto overflow-x-hidden'>
					{/* ---- COURSE CONTEXT SECTION ---- */}
					{course ? (
						<>
							<div className='px-6 pb-3 text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold w-[280px]'>
								{t('Course Overview')}
							</div>
							<ul className='list-none px-4 w-[280px] mb-6'>
								<li className='mb-2 rounded-lg w-full'>
									<NavLink
										to={`/dashboard/courses/${course.course_id}`}
										end
										className={({ isActive }) =>
											`${navLinkClass} ${isActive ? activeNavLinkClass : ''}`
										}
									>
										<span className='mr-3 flex items-center'>
											<BookOpen size={18} />
										</span>
										<span className='whitespace-nowrap overflow-hidden text-ellipsis'>
											{t('Curriculum Overview')}
										</span>
									</NavLink>
								</li>
							</ul>

							<div className='flex items-center justify-between px-6 my-4 w-[280px]'>
								<span className='text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold'>
									{t('Lessons')}
								</span>
								{onAddLesson && (
									<button
										className='bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center p-1 rounded transition-colors hover:bg-[#514587]/10 hover:text-[#514587]'
										onClick={onAddLesson}
										title={t('Add New Lesson')}
									>
										<PlusCircle size={18} />
									</button>
								)}
							</div>

							<ul className='list-none px-4 w-[280px] mb-6'>
								{lessons.length === 0 ? (
									<li className='px-4 py-6 text-center bg-[#f8f9fc] rounded-xl mx-2 mb-4'>
										<p className='text-gray-500 text-sm mb-3'>
											{t('No lessons yet')}
										</p>
										{onAddLesson && (
											<button
												className='bg-[#514587] text-white border-none py-2 px-4 rounded-full text-[0.85rem] font-semibold cursor-pointer inline-flex items-center transition-all shadow-sm hover:bg-[#3f356d] hover:-translate-y-[1px] hover:shadow-md'
												onClick={onAddLesson}
											>
												<PlusCircle size={16} className='mr-2' />
												{t('Create Lesson')}
											</button>
										)}
									</li>
								) : (
									lessons.map((lesson) => {
										const isActive = lesson.lesson_id === activeLessonId

										return (
											<li
												key={lesson.lesson_id}
												className='mb-2 rounded-lg w-full'
											>
												<div className='flex items-center relative w-full overflow-visible group'>
													<NavLink
														to={`/dashboard/courses/${course.course_id}/lessons/${lesson.lesson_id}`}
														className={({ isActive }) =>
															`flex-1 min-w-0 pr-10 ${navLinkClass} ${isActive ? activeNavLinkClass : ''}`
														}
													>
														<span className='mr-3 flex items-center shrink-0'>
															<Play size={18} />
														</span>
														<span
															className='whitespace-nowrap overflow-hidden text-ellipsis'
															title={lesson.title}
														>
															{lesson.title}
														</span>
													</NavLink>

													{(onEditLesson || onDeleteLesson) && (
														<button
															className={`lesson-more-btn absolute right-2 bg-transparent border-none cursor-pointer flex items-center justify-center p-1.5 rounded-full transition-colors z-[5] ${isActive ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-[#514587]/10 hover:text-[#514587] opacity-0 group-hover:opacity-100'} ${activeDropdownLessonId === lesson.lesson_id ? 'opacity-100' : ''}`}
															onClick={(e) =>
																toggleDropdown(e, lesson.lesson_id)
															}
															title={t('Lesson Actions')}
														>
															<MoreVertical size={18} />
														</button>
													)}

													{activeDropdownLessonId === lesson.lesson_id && (
														<div
															className='absolute top-[2.5rem] right-3 bg-white border border-[#ecebea] rounded-lg shadow-lg p-1.5 min-w-[180px] z-[100] flex flex-col gap-0.5'
															ref={dropdownRef}
														>
															{onEditLesson && (
																<button
																	onClick={(e) => {
																		e.stopPropagation()
																		onEditLesson(lesson)
																		setActiveDropdownLessonId(null)
																	}}
																	className='flex items-center w-full px-3 py-2 bg-transparent border-none rounded-md cursor-pointer text-gray-800 text-sm font-medium transition-colors hover:bg-[#514587]/10 hover:text-[#514587]'
																>
																	<Edit2 size={16} className='mr-2' />{' '}
																	{t('Rename Lesson')}
																</button>
															)}
															<div className='h-[1px] bg-[#ecebea] my-1'></div>
															{onDeleteLesson && (
																<button
																	onClick={(e) => {
																		e.stopPropagation()
																		onDeleteLesson(lesson.lesson_id)
																		setActiveDropdownLessonId(null)
																	}}
																	className='flex items-center w-full px-3 py-2 bg-transparent border-none rounded-md cursor-pointer text-red-500 text-sm font-medium transition-colors hover:bg-red-50'
																>
																	<Trash2 size={16} className='mr-2' />{' '}
																	{t('Delete Lesson')}
																</button>
															)}
														</div>
													)}
												</div>
											</li>
										)
									})
								)}
							</ul>

							<div className='px-6 pb-3 text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold w-[280px]'>
								{t('Community')}
							</div>
							<ul className='list-none px-4 w-[280px] mb-6'>
								<li className='mb-2 rounded-lg w-full'>
									<NavLink
										to={`/dashboard/courses/${course.course_id}/discussion`}
										className={({ isActive }) =>
											`${navLinkClass} ${isActive ? activeNavLinkClass : ''}`
										}
									>
										<span className='mr-3 flex items-center'>
											<MessageSquare size={18} />
										</span>
										<span className='whitespace-nowrap overflow-hidden text-ellipsis'>
											{t('Discussions')}
										</span>
									</NavLink>
								</li>
							</ul>
						</>
					) : (
						<>
							{/* ---- MAIN MENU SECTION ---- */}

							<div className='px-6 pb-3 text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold w-[280px]'>
								{t('Main Menu')}
							</div>
							<ul className='list-none px-4 w-[280px] mb-6 flex flex-col gap-1'>
								{navigationItems.map((item) => {
									const Icon = item.icon
									return (
										<li className='rounded-lg w-full' key={item.to}>
											<NavLink
												to={item.to}
												end={item.end}
												className={({ isActive }) =>
													`${navLinkClass} ${isActive ? activeNavLinkClass : ''} ${item.action === 'logout' ? logoutButtonStyle : ''}`
												}
												onClick={() => {
													if (item.action === 'logout') {
														handleLogout()
													}
												}}
											>
												<span className='mr-3 flex items-center'>
													<Icon size={18} />
												</span>
												<span className='whitespace-nowrap overflow-hidden text-ellipsis'>
													{t(item.label)}
												</span>
											</NavLink>
										</li>
									)
								})}
							</ul>
						</>
					)}
				</nav>
				{/* Language selection */}
				<div className='flex self-center'>
					{languageCards.map((lang, i) => (
						<div
							key={lang.code}
							className='flex items-center relative'
							onClick={(e) => {
								localStorage.setItem('language', lang.code)
								setCurrentLanguage(lang.code)
								i18n.changeLanguage(lang.code)
							}}
							onMouseEnter={() => {
								setIsHoverLanguage(true)
								setLanguageHovered(lang.icon)
							}}
							onMouseLeave={() => {
								setIsHoverLanguage(false)
								setLanguageHovered(null)
							}}
						>
							<div
								className={` ${i === 0 ? '' : 'w-px h-4 bg-gray-300 '} mx-2`}
							/>

							{isHoverLanguage && languageHovered === lang.icon && (
								<div className='absolute -top-12 left-3/5 -translate-x-1/2 flex flex-col items-center z-10'>
									{/* bubble */}
									<div className='flex items-center justify-center w-8 h-8 rounded-full'>
										<img src={languageHovered} />
									</div>

									{/* triangle */}
									<div className='w-2 h-2 border-r border-b border-gray-600 rotate-45 -mt-1'></div>
								</div>
							)}
							<div
								className={`language-card px-4 py-1 rounded-lg  cursor-pointer ${currentLanguage === lang.code ? 'bg-[#514587] text-white' : 'hover:text-[#514587] hover:bg-[#514587]/10'}`}
							>
								<span>{lang.label}</span>
							</div>
						</div>
					))}
				</div>
			</aside>
			{!isOpen && (
				<button
					className='fixed top-4 left-4 z-[50] bg-white border border-[#ecebea] shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer text-[#4d458d] flex items-center justify-center p-[6px] rounded-lg transition-colors hover:bg-[#5f4b96]/10 hover:text-[#5f4b96]'
					onClick={() => onToggle()}
					title={t('Open Sidebar')}
				>
					<MenuIcon size={18} />
				</button>
			)}
		</>
	)
}

const navigationItems = [
	{ label: 'Courses', to: '/dashboard', icon: DashboardIcon, end: true },
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
	{
		label: 'Log out',
		to: '/authentication',
		icon: LogoutIcon,
		action: 'logout',
	},
]

const languageCards = [
	{ code: 'en', label: 'EN', icon: EnFlag },
	{ code: 'sv', label: 'SV', icon: SvFlag },
	{ code: 'fi', label: 'FI', icon: FiFlag },
]

export default Sidebar
