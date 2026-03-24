import React from 'react'
import PropTypes from 'prop-types'

const ProfileHeader = ({ profile = {} }) => {
	const fullName =
		`${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
		profile.username ||
		'User'

	return (
		<div className='flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md md:flex-row md:items-center md:justify-between'>
			<div className='flex items-center gap-4'>
				<div className='flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#514587] text-2xl font-bold text-white'>
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
						<span className='rounded-full bg-[#514587] px-3 py-1 text-sm text-white capitalize'>
							{profile.role || 'user'}
						</span>
					</div>
				</div>
			</div>

			
		</div>
	)
}

ProfileHeader.propTypes = {
	profile: PropTypes.object,
}

export default ProfileHeader