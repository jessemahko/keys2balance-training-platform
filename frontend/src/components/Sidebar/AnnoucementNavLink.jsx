import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'

const AnnoucementNavLink = ({
	item,
	Icon,
	navLinkClass,
	activeNavLinkClass,
}) => {
	const { t } = useTranslation()
	const notifications = useSelector((state) => state.notifications)

	const hasUnread = useMemo(() => {
		return notifications.some((n) => !n.is_read)
	}, [notifications])

	return (
		<li className='rounded-lg w-full'>
			<NavLink
				to={item.to}
				end={item.end}
				className={({ isActive }) =>
					`${navLinkClass} ${isActive ? activeNavLinkClass : ''}`
				}
			>
				<span className='mr-3 flex items-center relative'>
					<Icon size={18} />
					{hasUnread && (
						<div className='ml-5 inline-block w-3 h-3 bg-[#e3b465] rounded-full absolute top-0 right-0'></div>
					)}
				</span>
				<span className='whitespace-nowrap overflow-hidden text-ellipsis'>
					{t(item.label)}
				</span>
			</NavLink>
		</li>
	)
}

export default AnnoucementNavLink

