import React from 'react'
import QuillDeltaRenderer from './QuillDeltaRenderer'

const TextBlock = ({ block }) => {
	return (
		<QuillDeltaRenderer
			delta={block?.data?.delta}
			legacyHtml={block?.data?.content}
		/>
	)
}

export default TextBlock
