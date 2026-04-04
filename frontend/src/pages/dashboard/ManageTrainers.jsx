import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUsersFn, toggleUserRoleFn } from '../../reducers/usersReducer'
import { useTranslation } from 'react-i18next'
import { setError, setNoti } from '../../reducers/notiReducer'

const ManageTrainers = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch()

    const allUsers = useSelector((state) => state.users) || []
    const [loading, setLoading] = useState(false)
    const [processingId, setProcessingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredUsers = allUsers.filter((user) => {
        const searchLower = searchTerm.toLowerCase()
        const fullName = `${user.first_name || user.username} ${user.last_name || ''}`.toLowerCase()
        const email = (user.email || '').toLowerCase()
        // Never show admins in this list
        return user.role !== 'admin' && (fullName.includes(searchLower) || email.includes(searchLower))
    }).sort((a, b) => a.username.localeCompare(b.username))

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

    return (
        <div className='p-6 bg-white rounded-xl shadow-sm h-[calc(100vh-48px)] flex flex-col max-w-5xl mx-auto'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-[#514587] m-0'>{t('Manage Trainers')}</h2>
            </div>

            <div className='mb-6'>
                <label className='grid gap-[0.45rem]'>
                    <span className='text-[0.85rem] font-bold uppercase tracking-[0.08em] text-[#7a7a7a]'>
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
            </div>

            <div className='flex-1 overflow-auto bg-[#f8f8fb] rounded-xl p-4 border border-[#ecebea]'>
                {loading ? (
                    <div className='flex justify-center items-center h-40'>
                        <p className='text-gray-500 font-medium'>{t('Loading users...')}</p>
                    </div>
                ) : (
                    <ul className='list-none p-0 m-0 flex flex-col gap-3 min-w-max w-full'>
                        {filteredUsers.length === 0 ? (
                            <p className='py-6 text-center text-gray-500 font-medium'>{t('No users found.')}</p>
                        ) : null}
                        {filteredUsers.map((user) => {
                            const isTrainer = user.role === 'trainer'
                            const isProcessing = processingId === user.user_id
                            return (
                                <li
                                    key={user.user_id}
                                    className='flex justify-between items-center py-4 px-5 bg-white rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md'
                                >
                                    <div className="flex flex-col gap-1">
                                        <strong className='text-[#222] text-[1.05rem]'>
                                            {user.first_name || user.username} {user.last_name || ''}
                                        </strong>
                                        <div className='flex items-center gap-3 text-[0.85rem] '>
                                            <span className='text-gray-500'>{user.email}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${isTrainer ? 'bg-[#514587]/10 text-[#514587]' : 'bg-gray-100 text-gray-500'}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleRole(user)}
                                        disabled={isProcessing}
                                        className={`min-w-[140px] px-4 py-2 rounded-lg font-bold border-none transition-all shadow-sm ${
                                            isProcessing
                                                ? 'cursor-not-allowed opacity-50 bg-gray-200 text-gray-500'
                                                : isTrainer
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer'
                                                    : 'bg-[#514587] text-white hover:bg-[#3f356d] hover:-translate-y-[1px] hover:shadow-md cursor-pointer'
                                        }`}
                                    >
                                        {isProcessing
                                            ? t('Processing...')
                                            : isTrainer
                                                ? t('Revoke Trainer')
                                                : t('Make Trainer')}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default ManageTrainers
