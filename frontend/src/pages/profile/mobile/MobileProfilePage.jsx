import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import ProfileHeader from '../../../components/profile/ProfileHeader'
import ProfileField from '../../../components/profile/ProfileField'
import EmailField from '../EmailField'
import PhoneDisplay from '../PhoneDisplay'
import PasswordField from '../PasswordField'
import { setNotification, setError } from '../../../reducers/notiReducer'
import { updateProfileFn } from '../../../reducers/userReducer'
import { isValidPhoneNumber } from 'libphonenumber-js'

const MobileProfilePage = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const user = useSelector((state) => state.user)

  const [isEditting, setIsEditting] = useState(false)
  const [isEdittingPassword, setIsEdittingPassword] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)

  const [formData, setFormData] = useState({
    ...user,
    date_of_birth: user.date_of_birth
      ? new Date(user.date_of_birth).toISOString().split('T')[0]
      : '',
  })

  useEffect(() => {
    document.title = t('Profile')
  }, [t])

  const handleFormChange = (e) => {
    const { name, value } = e.target

    if (name === 'phone') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.replace(/[^\d ]/g, '').replace(/\s+/g, ' '),
      }))
      return
    }

    if (name === 'first_name' || name === 'last_name') {
      setFormData((prev) => ({
        ...prev,
        [name]: value.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' '),
      }))
      return
    }

    if (name === 'date_of_birth') {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value).toISOString().split('T')[0],
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value.replace(/\s+/g, ' '),
    }))
  }

  const handleCancelEdit = () => {
    setIsEditting(false)
    setFormData({
      ...user,
      date_of_birth: user.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split('T')[0]
        : '',
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!formData.phone) {
      dispatch(setError('Phone number is required', 5))
      return
    }

    if (!formData.first_name) {
      dispatch(setError('First name is required', 5))
      return
    }

    if (!formData.last_name) {
      dispatch(setError('Last name is required', 5))
      return
    }

    if (!isValidPhoneNumber(`+${formData.phone}`)) {
      dispatch(setError('Invalid phone number', 5))
      return
    }

    try {
      const profileToUpdate = {
        phone: formData.phone,
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        is_verified: user.is_verified,
      }

      dispatch(updateProfileFn(profileToUpdate))
      dispatch(setNotification('Profile updated successfully', 5))
      setIsEditting(false)
    } catch (error) {
      dispatch(setError('Failed to save profile', 5))
    }
  }

  const isAllowSaveProfile =
    formData.first_name &&
    formData.last_name &&
    formData.phone &&
    isValidPhoneNumber(`+${formData.phone}`)

  const isEdittingEmailOrPassword = isEdittingPassword || isEditingEmail

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4">
      <div className="mx-auto max-w-md space-y-4">
        <ProfileHeader user={user} />

        <div className="rounded-2xl bg-white p-4 shadow-md">
          <PasswordField
            isEdittingPassword={isEdittingPassword}
            setIsEdittingPassword={setIsEdittingPassword}
          />
        </div>

        <div className={`rounded-2xl bg-white p-4 shadow-md ${isEdittingPassword ? 'opacity-20' : ''}`}>
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            {t('Basic Information')}
          </h3>

          <div className="space-y-4">
            <ProfileField
              label={t('Username')}
              name="username"
              value={formData.username || ''}
              onChange={handleFormChange}
              disabled
            />

            <EmailField
              disabled={isEdittingPassword}
              isEditingEmail={isEditingEmail}
              setIsEditingEmail={setIsEditingEmail}
            />

            <div className={`${isEdittingEmailOrPassword ? 'opacity-20' : ''}`}>
              {isEditting ? (
                <ProfileField
                  label={t('Phone')}
                  name="phone"
                  type="text"
                  value={formData.phone ? `+${formData.phone}` : ''}
                  onChange={handleFormChange}
                  disabled={isEdittingEmailOrPassword || !isEditting}
                  placeholder="eg. +358 123 4567"
                  required={true}
                  maxLength={15}
                />
              ) : (
                <PhoneDisplay user={user} />
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-2xl bg-white p-4 shadow-md ${isEdittingEmailOrPassword ? 'opacity-20' : ''}`}>
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            {t('Personal Details')}
          </h3>

          <div className="space-y-4">
            <ProfileField
              label={t('First Name')}
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleFormChange}
              disabled={isEdittingEmailOrPassword || !isEditting}
              required={true}
              placeholder={t('Enter your first name')}
            />

            <ProfileField
              label={t('Last Name')}
              name="last_name"
              value={formData.last_name || ''}
              onChange={handleFormChange}
              disabled={isEdittingEmailOrPassword || !isEditting}
              required={true}
              placeholder={t('Enter your last name')}
            />

            <ProfileField
              label={t('Gender')}
              name="gender"
              value={formData.gender || ''}
              onChange={handleFormChange}
              disabled={isEdittingEmailOrPassword || !isEditting}
            />

            <ProfileField
              label={t('Date of Birth')}
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={handleFormChange}
              disabled={isEdittingEmailOrPassword || !isEditting}
            />
          </div>
        </div>

        {isEditting ? (
          <div className={`grid grid-cols-2 gap-3 ${isEdittingEmailOrPassword ? 'opacity-20' : ''}`}>
            <button
              type="button"
              className={`rounded-xl px-4 py-3 font-semibold text-white transition ${
                isAllowSaveProfile ? 'bg-[#514587]' : 'cursor-not-allowed bg-gray-400'
              }`}
              disabled={isEdittingEmailOrPassword || !isAllowSaveProfile}
              onClick={handleSave}
            >
              {t('Save')}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700"
              disabled={isEdittingEmailOrPassword}
            >
              {t('Cancel')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition ${
              !user.first_name || !user.last_name || !user.phone
                ? 'bg-[#e3b465]'
                : 'bg-[#514587]'
            }`}
            disabled={isEdittingEmailOrPassword}
            onClick={() => setIsEditting(true)}
          >
            {t('Edit Profile')}
          </button>
        )}
      </div>
    </div>
  )
}

export default MobileProfilePage