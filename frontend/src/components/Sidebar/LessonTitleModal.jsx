import React, { useState, useEffect } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import { useTranslation } from 'react-i18next'

const LessonTitleModal = ({
	isOpen,
	onClose,
	onConfirm,
	initialTitle = '',
	isEdit = false,
}) => {
	const { t } = useTranslation()
	const [title, setTitle] = useState(initialTitle)

	useEffect(() => {
		if (isOpen) {
			setTitle(initialTitle)
		}
	}, [isOpen, initialTitle])

	if (!isOpen) return null

	const handleSubmit = (e) => {
		e.preventDefault()
		if (title.trim()) {
			onConfirm(title.trim())
			onClose()
		}
	}

	return (
		<div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex z-[1000] p-3 sm:p-5 animate-in fade-in duration-200 overflow-auto'>
			<div className='bg-white w-full m-auto max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl flex flex-col animate-in slide-in-from-bottom-8 duration-300 min-w-[300px] max-w-full'>
				<div className='p-6 md:px-8 border-b border-border-color flex justify-between items-center sticky top-0 bg-white z-10'>
					<h2 className='text-xl text-[#514587] font-bold'>
						{isEdit ? t('Rename Lesson') : t('Create New Lesson')}
					</h2>
					<button
						onClick={onClose}
						className='bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center p-1 rounded-lg transition-colors hover:bg-sidebar-bg hover:text-red-500'
					>
						<CloseRoundedIcon sx={{ fontSize: 24 }} />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className='p-4 sm:p-8 flex-1 flex flex-col gap-6'
				>
					<div className='flex flex-col'>
						<label className='block font-semibold text-gray-800 mb-2 text-[0.95rem]'>
							{t('Lesson Title:')}
						</label>
						<input
							type='text'
							className='w-full px-4 py-3 border border-border-color rounded-lg text-base font-sans transition-all bg-[#fdfdfd] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={t('e.g. Advanced Balance Techniques')}
							autoFocus
							required
						/>
					</div>

					<div className='flex flex-col sm:flex-row gap-4 pt-4 border-t border-border-color'>
						<button
							type='submit'
							className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#514587] text-white border-none transition-opacity hover:opacity-90 flex-1 cursor-pointer'
						>
							<SaveRoundedIcon sx={{ fontSize: 18, mr: 1 }} />
							{isEdit ? t('Save Changes') : t('Create Lesson')}
						</button>
						<button
							type='button'
							onClick={onClose}
							className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#EBE8F5] text-[#4f4965] border-none transition-opacity hover:opacity-90 flex-1 cursor-pointer'
						>
							{t('Cancel')}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default LessonTitleModal
