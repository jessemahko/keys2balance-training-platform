import { useState, useEffect } from 'react'

import Login from './Login'
import Register from './Register'

const Authentication = () => {
	const [active, setActive] = useState(location.state?.active || false)

	useEffect(() => {
		document.title = active ? 'Register' : 'Login'
	}, [active])

	return (
		<div className='authentication'>
			<div className={`${active ? 'active' : ''}`}>
				<Login />
				<Register setActive={setActive} />
			</div>
		</div>
	)
}

export default Authentication

