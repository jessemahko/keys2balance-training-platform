import React, { Fragment, useMemo } from 'react'

function wrapText(text, attrs) {
	let node = text

	if (attrs?.link) {
		// React escapes text; href is treated as an attribute, not HTML.
		// We still only allow http(s)/mailto links for safety.
		const href = String(attrs.link)
		const isHttp =
			href.startsWith('http://') ||
			href.startsWith('https://')
		const isMailto = href.startsWith('mailto:')
		const isSafe = isHttp || isMailto

		// If the scheme is not allowed, render as plain text (no broken/empty link).
		if (!isSafe) {
			node = text
		} else {
			const target = isHttp ? '_blank' : undefined
			const rel = isHttp ? 'noreferrer noopener' : undefined
		node = (
			<a
				href={href}
				className="text-primary underline underline-offset-2 break-words hover:text-primary/80"
				{...(target ? { target } : {})}
				{...(rel ? { rel } : {})}
			>
				{text}
			</a>
		)
		}
	}

	if (attrs?.bold) node = <strong>{node}</strong>
	if (attrs?.italic) node = <em>{node}</em>
	if (attrs?.underline) node = <u>{node}</u>
	if (attrs?.strike) node = <s>{node}</s>

	return node
}

function normalizeDelta(delta) {
	if (!delta) return null
	if (Array.isArray(delta?.ops)) return delta
	if (Array.isArray(delta)) return { ops: delta }
	return null
}

function deltaToLines(delta) {
	const lines = []
	let current = { inlines: [], attrs: {} }

	const pushLine = (attrs) => {
		lines.push({ inlines: current.inlines, attrs: attrs || current.attrs || {} })
		current = { inlines: [], attrs: {} }
	}

	for (const op of delta.ops || []) {
		if (typeof op.insert !== 'string') {
			// Ignore embeds for now (images/videos). Keep rendering safe + simple.
			continue
		}

		const parts = op.insert.split('\n')
		for (let i = 0; i < parts.length; i++) {
			const chunk = parts[i]
			if (chunk) {
				current.inlines.push({ text: chunk, attrs: op.attributes || null })
			}

			// Newline => end of line; Quill attaches line-level attrs to the '\n'
			if (i !== parts.length - 1) {
				pushLine(op.attributes || {})
			}
		}
	}

	// If delta doesn't end with newline, flush trailing line.
	if (current.inlines.length > 0) pushLine({})

	return lines
}

function renderLines(lines) {
	const out = []
	let listMode = null // 'bullet' | 'ordered' | null
	let listItems = []

	const flushList = () => {
		if (!listMode || listItems.length === 0) return
		const ListTag = listMode === 'ordered' ? 'ol' : 'ul'
		const listClassName =
			listMode === 'ordered' ? 'ml-6 mb-4 list-decimal' : 'ml-6 mb-4 list-disc'
		out.push(
			<ListTag key={`list-${out.length}`} className={listClassName}>
				{listItems}
			</ListTag>,
		)
		listMode = null
		listItems = []
	}

	for (let idx = 0; idx < lines.length; idx++) {
		const line = lines[idx]
		const lineList = line.attrs?.list || null // 'bullet' | 'ordered'

		const inlines = line.inlines.map((s, i) => (
			<Fragment key={i}>{wrapText(s.text, s.attrs)}</Fragment>
		))

		if (lineList) {
			if (listMode && listMode !== lineList) flushList()
			listMode = lineList
			listItems.push(
				<li key={`li-${idx}`} className="mb-2">
					{inlines}
				</li>,
			)
			continue
		}

		flushList()

		const headerLevel = line.attrs?.header
		if (headerLevel === 1) {
			out.push(
				<h1 key={`h1-${idx}`} className="text-3xl text-primary mb-4 font-bold">
					{inlines}
				</h1>,
			)
		} else if (headerLevel === 2) {
			out.push(
				<h2 key={`h2-${idx}`} className="text-2xl text-primary mt-6 mb-3 font-semibold">
					{inlines}
				</h2>,
			)
		} else {
			out.push(
				<p key={`p-${idx}`} className="mb-4 text-[1.05rem] leading-relaxed">
					{inlines}
				</p>,
			)
		}
	}

	flushList()
	return out
}

function htmlToPlainText(html) {
	if (!html || typeof html !== 'string') return ''
	// Avoid DOMParser to keep this file SSR-friendly and simple.
	return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export default function QuillDeltaRenderer({ delta, legacyHtml }) {
	const normalized = useMemo(() => normalizeDelta(delta), [delta])

	const nodes = useMemo(() => {
		if (normalized) {
			const lines = deltaToLines(normalized)
			return renderLines(lines)
		}
		// Backward-compat: render legacy HTML as plain text (safe).
		const text = htmlToPlainText(legacyHtml)
		if (!text) return null
		return <p className="mb-4 text-[1.05rem] leading-relaxed">{text}</p>
	}, [normalized, legacyHtml])

	if (!nodes) return null
	return <div className="text-gray-800 break-words overflow-hidden">{nodes}</div>
}

