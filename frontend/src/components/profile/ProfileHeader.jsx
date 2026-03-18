import React from 'react'
import PropTypes from 'prop-types'

const ProfileHeader = ({ profile }) => {
	const fullName =
		`${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
		profile.username ||
		'Admin'

	return (
		<div className='flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md md:flex-row md:items-center md:justify-between'>
			<div className='flex items-center gap-4'>
				<div className='flex h-20 w-20 items-center justify-center rounded-full bg-[#514587] text-2xl font-bold text-white overflow-hidden'>
					{profile.avatar_url ? (
						<img
							src={profile.avatar_url}
							alt='avatar'
							className='h-full w-full object-cover'
						/>
					) : (
						fullName.charAt(0).toUpperCase()
					)}
				</div>

				<div>
					<h1 className='text-2xl font-bold text-gray-800'>{fullName}</h1>
					<p className='text-gray-500'>{profile.email || 'No email'}</p>

					<div className='mt-3 flex flex-wrap gap-2'>
						<span className='rounded-full bg-[#514587] px-3 py-1 text-sm text-white'>
							{profile.role || 'admin'}
						</span>

						<span
							className={`rounded-full px-3 py-1 text-sm text-white ${
								profile.is_verified ? 'bg-green-500' : 'bg-yellow-500'
							}`}
						>
							{profile.is_verified ? 'Verified' : 'Not Verified'}
						</span>

						<span
							className={`rounded-full px-3 py-1 text-sm text-white ${
								profile.is_active ? 'bg-blue-500' : 'bg-red-500'
							}`}
						>
							{profile.is_active ? 'Active' : 'Inactive'}
						</span>
					</div>
				</div>
			</div>

			<div className='text-sm text-gray-500 space-y-1'>
				<p>
					<span className='font-semibold text-gray-700'>Username:</span>{' '}
					{profile.username || '-'}
				</p>
				<p>
					<span className='font-semibold text-gray-700'>User ID:</span>{' '}
					{profile.user_id || profile.id || '-'}
				</p>
			</div>
		</div>
	)
}

ProfileHeader.propTypes = {
	profile: PropTypes.object.isRequired,
}

export default ProfileHeader