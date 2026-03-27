import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const SectionPlaceholder = ({ title, description, backTo, actionLabel }) => {
	const { t } = useTranslation()
	return (
		<section className='rounded-[18px] bg-white border border-[#4a4a4a]/[0.08] shadow-[0_10px_30px_rgba(90,90,90,0.08)] p-[1.3rem] flex flex-col gap-4 items-center text-center'>
			<p className='m-0 p-[0.35rem_0.75rem] rounded-full bg-[#edf5ff] text-[#4d458d] text-[0.78rem] font-bold uppercase tracking-[0.08em]'>
				{t('Reserved section')}
			</p>
			<h2 className='m-0 text-[#222]'>{t(title)}</h2>
			<p className='m-0 text-[#666] leading-relaxed'>{t(description)}</p>
			<Link
				to={backTo}
				className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#33b5aa] text-white transition-opacity hover:opacity-90'
			>
				{t(actionLabel)}
			</Link>
		</section>
	)
}

SectionPlaceholder.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	backTo: PropTypes.string.isRequired,
	actionLabel: PropTypes.string.isRequired,
}

export default SectionPlaceholder
