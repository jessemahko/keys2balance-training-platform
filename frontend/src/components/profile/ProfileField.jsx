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
}) => {
	return (
		<div className='flex flex-col gap-2'>
			<label className='text-sm font-semibold text-gray-700'>{label}</label>
			<input
				className='rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#514587] focus:ring-2 focus:ring-[#9484b4] disabled:bg-gray-100 disabled:text-gray-500'
				type={type}
				name={name}
				value={value || ''}
				onChange={onChange}
				disabled={disabled}
				placeholder={placeholder}
			/>
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
}

export default ProfileField