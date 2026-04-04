import React from 'react'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const BlockContainer = ({
	block,
	children,
	canEdit,
	onEdit,
	onDelete,
	onAddBelow,
}) => {
	const { t } = useTranslation()
	return (
		<div className='relative mb-6 group'>
			<div className='relative bg-white rounded-2xl p-8 shadow-sm border border-border-color transition-all duration-200 hover:border-primary-light hover:shadow-[0_14px_25px_rgba(81,69,135,0.15)] hover:scale-[1.01]'>
				{/* Admin/Trainer controls shown on hover */}
				{canEdit && (
					<div className='absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
						<button
							className='bg-white border border-border-color rounded-md w-8 h-8 flex items-center justify-center cursor-pointer text-gray-500 shadow-sm transition-colors hover:text-primary hover:border-primary hover:bg-primary/5'
							onClick={() => onEdit(block)}
							title={t('Edit Block')}
						>
							<Edit2 size={16} />
						</button>
						<button
							className='bg-white border border-border-color rounded-md w-8 h-8 flex items-center justify-center cursor-pointer text-gray-500 shadow-sm transition-colors hover:text-red-500 hover:border-red-500 hover:bg-red-500/5'
							onClick={() => onDelete(block.block_id)}
							title={t('Delete Block')}
						>
							<Trash2 size={16} />
						</button>
					</div>
				)}

				{/* The actual content block (TextBlock, ZoomBlock, etc.) */}
				<div className='relative'>{children}</div>
			</div>

			{/* Add Block button below every block for Trainers */}
			{canEdit && (
				<div className='flex justify-center mt-3 h-0 overflow-visible relative z-[2] opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
					<button
						className='bg-white border border-primary-light text-primary rounded-full w-9 h-9 flex items-center justify-center cursor-pointer shadow-md transition-all -translate-y-1/2 hover:bg-primary hover:text-white hover:scale-110 hover:shadow-lg'
						onClick={() => onAddBelow(block.block_id)}
						title={t('Add a new block here')}
					>
						<Plus size={20} />
					</button>
				</div>
			)}
		</div>
	)
}

export default BlockContainer
