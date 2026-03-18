import { useState } from 'react'

export const useField = (type, content = '') => {
	const [value, setValue] = useState(content)

	const onChange = (event) => setValue(event.target.value)

	const remove = () => setValue('')

	return {
		type,
		value,
		onChange,
		remove,
	}
}

