import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUsersFn, toggleUserRoleFn } from '../../reducers/usersReducer'
import { useTranslation } from 'react-i18next'
import { setError, setNoti } from '../../reducers/notiReducer'
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'

const ROLE_FILTERS = [
	{ value: 'all', label: 'All' },
	{ value: 'participant', label: 'Participants' },
	{ value: 'trainer', label: 'Trainers' },
]

const RoleDropdown = ({ user, processingId, onToggleRole, t }) => {
	const [open, setOpen] = useState(false)
	const dropdownRef = useRef(null)
	const isProcessing = processingId === user.user_id
	const isTrainer = user.role === 'trainer'
	const otherRole = isTrainer ? 'participant' : 'trainer'
	const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleSelect = () => {
		setOpen(false)
		onToggleRole(user)
	}

	return (
		<div ref={dropdownRef} className='relative shrink-0' style={{ width: 140 }}>
			{/* Current role capsule — always visible */}
			<button
				type='button'
				onClick={() => !isProcessing && setOpen((prev) => !prev)}
				disabled={isProcessing}
				className='w-full flex items-center justify-between px-4 rounded-full border-none text-[0.85rem] font-bold transition-all duration-200 relative z-10'
				style={{
					height: 38,
					backgroundColor: isProcessing ? '#e5e7eb' : '#514587',
					color: isProcessing ? '#9ca3af' : '#fff',
					opacity: isProcessing ? 0.6 : 1,
					cursor: isProcessing ? 'not-allowed' : 'pointer',
				}}
			>
				<span>{isProcessing ? t('Processing...') : t(capitalize(user.role))}</span>
				{!isProcessing && (
					<KeyboardArrowDownRoundedIcon
						sx={{
							fontSize: 20,
							transition: 'transform 0.3s',
							transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
						}}
					/>
				)}
			</button>

			{/* Expanding canvas behind — holds the other role capsule */}
			<div
				className='absolute left-0 right-0 top-0 rounded-[20px] overflow-hidden transition-all duration-300 ease-in-out'
				style={{
					height: open ? 88 : 38,
					backgroundColor: '#EBE8F5',
					boxShadow: open ? '0 4px 16px rgba(81, 69, 135, 0.18)' : 'none',
					opacity: open ? 1 : 0,
					pointerEvents: open ? 'auto' : 'none',
				}}
			>
				{/* Spacer for the top capsule */}
				<div style={{ height: 42 }} />
				{/* Other role capsule */}
				<div className='px-1 pb-1'>
					<button
						type='button'
						onClick={handleSelect}
						className='w-full flex items-center px-4 rounded-full border-none text-[0.85rem] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#ddd8ed]'
						style={{
							height: 36,
							backgroundColor: 'transparent',
							color: '#4f4965',
						}}
					>
						<span>{t(capitalize(otherRole))}</span>
					</button>
				</div>
			</div>
		</div>
	)
}

const ManageTrainers = () => {
	const { t } = useTranslation()
	const dispatch = useDispatch()

	const allUsers = useSelector((state) => state.users) || []
	const [loading, setLoading] = useState(false)
	const [processingId, setProcessingId] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [roleFilter, setRoleFilter] = useState('all')
	const debouncedSearchTerm = useDebouncedSearch(searchTerm)

	const filteredUsers = allUsers
		.filter((user) => {
			if (user.role === 'admin') return false
			const searchLower = debouncedSearchTerm.toLowerCase()
			const fullName = `${user.first_name || user.username} ${user.last_name || ''}`.toLowerCase()
			const email = (user.email || '').toLowerCase()
			const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower)
			const matchesRole = roleFilter === 'all' || user.role === roleFilter
			return matchesSearch && matchesRole
		})
		.sort((a, b) => a.username.localeCompare(b.username))

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true)
			try {
				await dispatch(setUsersFn())
			} catch (err) {
				dispatch(setError(t('Failed to load users.'), 5))
			} finally {
				setLoading(false)
			}
		}
		if (allUsers.length === 0) {
			fetchUsers()
		} else {
			// Refresh quietly
			dispatch(setUsersFn()).catch(() =>
				dispatch(setError(t('Failed to refresh users.'), 5)),
			)
		}
	}, [dispatch, t, allUsers.length])

	const handleToggleRole = async (user) => {
		setProcessingId(user.user_id)
		try {
			const newRole = user.role === 'trainer' ? 'participant' : 'trainer'
			await dispatch(toggleUserRoleFn(user.user_id, newRole))
			dispatch(setNoti(t(`Successfully changed role to ${newRole}.`), 3))
		} catch (err) {
			dispatch(setError(t('Failed to change user role.'), 5))
		} finally {
			setProcessingId(null)
		}
	}

	const getInitial = (user) => {
		const name = user.first_name || user.username || ''
		return name.charAt(0).toUpperCase()
	}

	return (
		<div className='max-w-5xl mx-auto py-6 px-4 flex flex-col gap-5'>
			{/* Header + Search card */}
			<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-[0.85rem] min-w-[320px]'>
				<h2 className='text-2xl font-bold text-[#514587] m-0'>{t('Manage Trainers')}</h2>
				<label className='grid gap-[0.45rem]'>
					<span className='text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#7a7a7a]'>
						{t('Search Users')}
					</span>
					<input
						type='search'
						className='w-full p-[0.85rem_1rem] border border-[#4d458d]/[0.16] rounded-[14px] bg-[#f8f8fb] text-[#222] focus:outline-none focus:ring-2 focus:ring-[#5f4b96]/20 focus:border-[#5f4b96] transition-all'
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder={t('Search by name or email')}
					/>
				</label>
			</section>

			{/* Filter bar */}
			<div className='flex items-center gap-[10px] flex-wrap'>
				<span className='text-[14px] text-[#6a6580] font-semibold'>{t('Filter by')}</span>
				<div className='flex items-center bg-[#ebe8f5] p-[4px] rounded-full gap-[4px]'>
					{ROLE_FILTERS.map((option) => (
						<button
							key={option.value}
							type='button'
							onClick={() => setRoleFilter(option.value)}
							className='border-none bg-transparent text-[#4f4965] px-3 py-[7px] rounded-full text-[13px] font-semibold cursor-pointer transition-all duration-200'
							style={
								roleFilter === option.value
									? { backgroundColor: '#6b5b95', color: '#fff', boxShadow: '0 2px 8px rgba(75, 57, 128, 0.2)' }
									: {}
							}
						>
							{t(option.label)}
						</button>
					))}
				</div>
			</div>

			{/* User cards */}
			{loading ? (
				<div className='flex justify-center items-center h-40'>
					<p className='text-gray-500 font-medium'>{t('Loading users...')}</p>
				</div>
			) : filteredUsers.length === 0 ? (
				<div className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
					<h3 className='m-0 text-[#222]'>{t('No users found.')}</h3>
					<p className='m-0 text-[#666] leading-relaxed'>
						{t('Try another search term or adjust the filter.')}
					</p>
				</div>
			) : (
				<div className='flex flex-col gap-4'>
					{filteredUsers.map((user) => (
						<div
							key={user.user_id}
							className='flex items-center justify-between p-5 bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] rounded-[18px] transition-all duration-180 ease-in-out hover:-translate-y-[1px] hover:shadow-[0_16px_32px_rgba(90,90,90,0.12)] gap-4 min-w-[320px]'
						>
							<div className='flex items-center gap-4 min-w-0'>
								{/* Avatar */}
								<div className='w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#e2e8f0] text-[#475569] flex items-center justify-center font-semibold text-sm'>
									{getInitial(user)}
								</div>
								<div className='flex flex-col gap-0.5 min-w-0'>
									<strong className='text-[#222] text-[1.05rem] truncate'>
										{user.first_name || user.username} {user.last_name || ''}
									</strong>
									<span className='text-[0.85rem] text-gray-500 truncate'>{user.email}</span>
								</div>
							</div>
							<RoleDropdown
								user={user}
								processingId={processingId}
								onToggleRole={handleToggleRole}
								t={t}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default ManageTrainers
