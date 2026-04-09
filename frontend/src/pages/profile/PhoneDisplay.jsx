import 'react-phone-input-2/lib/style.css'
import { useState, useEffect, use } from 'react'
import { useSelector } from 'react-redux'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import ProfileField from '../../components/profile/ProfileField'
import { useTranslation } from 'react-i18next'

const PhoneDisplay = ({ user }) => {
	const [phone, setPhone] = useState(`+${user?.phone}`) // handle null phone number
	const [country, setCountry] = useState('')
	const [formattedPhone, setFormattedPhone] = useState('')
	const { t } = useTranslation()

	useEffect(() => {
		if (user?.phone) {
			setPhone(`+${user?.phone}`)
		} else {
			setPhone('')
		}
	}, [user])

	useEffect(() => {
		if (phone) {
			// Parse the phone number and format it based on the country
			const phoneNumber = parsePhoneNumberFromString(phone, country)

			if (phoneNumber) {
				const formatted = `${phoneNumber.formatInternational()}`
				setFormattedPhone(formatted)
				setCountry(phoneNumber.country)
			}
		}
	}, [phone, country])

	// Get the flag URL based on country code
	const getCountryFlag = () => {
		return country ? `https://flagcdn.com/w20/${country.toLowerCase()}.png` : ''
	}

	return (
		<div>
			{phone && country ? (
				<div className='flex flex-col gap-2 relative'>
					<label className='text-sm font-semibold text-gray-700'>
						{t('Phone')}
					</label>
					<div className='flex items-center mt-3 ml-1'>
						<div className='bg-slate-100 rounded-lg flex items-center justify-center p-2'>
							<img
								src={getCountryFlag()}
								alt='Flag'
								className='w-[90%] h-[90%] scale-130'
							/>
						</div>
						<span>{formattedPhone}</span>
					</div>
				</div>
			) : (
				<ProfileField
					label={t('Phone')}
					name='phone'
					type='text'
					value={`+${user?.phone || ''}`} // handle null phone number
					onChange={() => {}}
					disabled={true}
					placeholder={'eg. +358 123 4567'}
					required={true}
				/>
			)}
		</div>
	)
}

export default PhoneDisplay
