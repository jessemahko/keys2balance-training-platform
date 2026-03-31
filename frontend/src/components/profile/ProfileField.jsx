import React from 'react'
import PropTypes from 'prop-types'

const ProfileField = ({
	label,
	name,
	value,
	onChange,
	type = 'text',
	disabled = false,
	placeholder = '',
	icon = null,
	required = false,
	maxLength = null,
}) => {
	return (
		<div className='flex flex-col gap-2 relative'>
			<div className='flex justify-between'>
				<label className='text-sm font-semibold text-gray-700'>{label}</label>
				{required && (!value || value === '+') && (
					<>
						<span className='text-sm font-semibold text-red-500'>
							*{'  '}required
						</span>
					</>
				)}
			</div>
			<input
				className={`${icon !== null ? 'pr-15' : ''} rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#514587] focus:ring-2 focus:ring-[#9484b4] disabled:bg-gray-100 disabled:text-gray-500 `}
				type={type}
				name={name}
				value={value || ''}
				onChange={onChange}
				disabled={disabled}
				placeholder={placeholder}
				required={required}
				maxLength={maxLength}
			/>
			{icon && <div className='absolute right-3 top-1/2 transform'>{icon}</div>}
		</div>
	)
}

ProfileField.propTypes = {
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func,
	type: PropTypes.string,
	disabled: PropTypes.bool,
	placeholder: PropTypes.string,
	icon: PropTypes.node,
	required: PropTypes.bool,
	editEmail: PropTypes.func,
	verified: PropTypes.bool,
}

export default ProfileField
