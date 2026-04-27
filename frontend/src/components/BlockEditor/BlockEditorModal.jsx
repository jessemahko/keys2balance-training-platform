import React, { useState, useEffect, useRef } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { useTranslation } from 'react-i18next'

const BlockEditorModal = ({ isOpen, onClose, onSave, initialData, isNew, saving }) => {
	const { t } = useTranslation()
	const [type, setType] = useState('text')
	const [formData, setFormData] = useState({})
	const [dragActive, setDragActive] = useState(false)
	const fileInputRef = useRef(null)

	// Quill configuration
	const quillModules = {
		toolbar: [
			[{ header: '1' }, { header: '2' }],
			['bold', 'italic', 'underline', 'strike'],
			[{ list: 'ordered' }, { list: 'bullet' }],
			['link', 'clean'],
		],
	}

	const quillFormats = [
		'header',
		'bold',
		'italic',
		'underline',
		'strike',
		'list',
		'link',
	]

	useEffect(() => {
		if (initialData) {
			setType(initialData.type || 'text')
			setFormData(initialData.data || {})
		} else {
			setType('text')
			setFormData({})
		}
		setDragActive(false)
	}, [initialData, isOpen])

	if (!isOpen) return null

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleQuillChange = (_content, _delta, _source, editor) => {
		// Persist a constrained rich-text representation (Quill Delta), not raw HTML.
		// Rendering from Delta avoids executing HTML and prevents XSS by design.
		const delta = editor?.getContents?.()
		setFormData((prev) => ({ ...prev, delta }))
	}

	// File picker helpers
	const handleFilesSelected = async (fileList) => {
		const filesArray = Array.from(fileList)
		const newFiles = await Promise.all(
			filesArray.map((f) => {
				return new Promise((resolve) => {
					const reader = new FileReader()
					reader.onload = (e) => {
						resolve({
							name: f.name,
							size: f.size,
							type: f.type || 'application/octet-stream',
							url: e.target.result,
						})
					}
					reader.readAsDataURL(f)
				})
			}),
		)
		setFormData((prev) => ({
			...prev,
			files: [...(prev.files || []), ...newFiles],
		}))
	}

	const removeFile = (index) => {
		setFormData((prev) => ({
			...prev,
			files: prev.files.filter((_, i) => i !== index),
		}))
	}

	const formatFileSize = (bytes) => {
		if (bytes < 1024) return `${bytes} B`
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		onSave({
			type,
			data: formData,
			...(initialData?.block_id ? { block_id: initialData.block_id } : {}),
		})
	}

	const inputClass =
		'w-full px-4 py-3 border border-border-color rounded-lg text-base font-sans transition-all bg-[#fdfdfd] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
	const labelClass = 'block font-semibold text-gray-800 mb-2 text-[0.95rem]'

	return (
		<div className='absolute inset-0 bg-black/40 backdrop-blur-sm flex z-[1000] p-3 sm:p-5 animate-in fade-in duration-200 overflow-auto'>
			<div className='bg-white w-full m-auto max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl flex flex-col animate-in slide-in-from-bottom-8 duration-300 min-w-[300px] max-w-full'>
				<div className='p-6 md:px-8 border-b border-border-color flex justify-between items-center sticky top-0 bg-white z-10'>
					<h2 className='text-xl text-primary font-bold'>
						{isNew ? t('Add New Content Block') : t('Edit Block')}
					</h2>
					<button
						onClick={onClose}
						className='bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center p-1 rounded-lg transition-colors hover:bg-sidebar-bg hover:text-red-500'
					>
						<X size={24} />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className='p-4 sm:p-8 flex-1 flex flex-col gap-6'
				>
					{isNew && (
						<div>
							<label className={labelClass}>{t('Block Type:')}</label>
							<select
								value={type}
								onChange={(e) => {
									setType(e.target.value)
									setFormData({})
								}}
								className={inputClass}
							>
								<option value='text'>{t('Rich Text')}</option>
								<option value='zoom_card'>{t('Zoom Meeting')}</option>
								<option value='file_attachment'>{t('File Attachment')}</option>
								<option value='recording_link'>{t('Link / Recording')}</option>
							</select>
						</div>
					)}

					{/* ---- TEXT BLOCK ---- */}
					{type === 'text' && (
						<div>
							<label className={labelClass}>{t('Content:')}</label>
							<div className='bg-white rounded-lg overflow-hidden border border-border-color transition-all focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15 [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border-color [&_.ql-toolbar]:bg-[#fdfdfd] [&_.ql-toolbar]:px-3 [&_.ql-toolbar]:py-2 [&_.ql-container.ql-snow]:border-none [&_.ql-container.ql-snow]:min-h-[200px] [&_.ql-container.ql-snow]:font-sans [&_.ql-container.ql-snow]:text-base [&_.ql-editor]:break-words [&_.ql-editor]:leading-relaxed [&_.ql-editor]:text-gray-800 [&_.ql-editor.ql-blank::before]:text-[#bbb] [&_.ql-editor.ql-blank::before]:not-italic [&_.ql-snow_.ql-stroke]:stroke-gray-500 [&_.ql-snow_.ql-fill]:fill-gray-500 [&_.ql-snow_.ql-picker]:text-gray-500'>
								<ReactQuill
									theme='snow'
									// ReactQuill supports Delta values. Fall back to legacy HTML for older saved lessons.
									value={formData.delta || formData.content || ''}
									onChange={handleQuillChange}
									modules={quillModules}
									formats={quillFormats}
									placeholder={t('Start typing your lesson content here...')}
								/>
							</div>
						</div>
					)}

					{/* ---- ZOOM MEETING CARD ---- */}
					{type === 'zoom_card' && (
						<>
							<div>
								<label className={labelClass}>{t('Meeting Title:')}</label>
								<input
									type='text'
									name='title'
									value={formData.title || ''}
									onChange={handleChange}
									className={inputClass}
									required
								/>
							</div>
							<div className='flex gap-4'>
								<div className='flex-1'>
									<label className={labelClass}>{t('Date:')}</label>
									<input
										type='date'
										name='date'
										value={formData.date || ''}
										onChange={handleChange}
										className={inputClass}
										required
									/>
								</div>
								<div className='flex-1'>
									<label className={labelClass}>{t('Time:')}</label>
									<input
										type='time'
										name='time'
										value={formData.time || ''}
										onChange={handleChange}
										className={inputClass}
										required
									/>
								</div>
							</div>
							<div>
								<label className={labelClass}>{t('Zoom Join Link:')}</label>
								<input
									type='url'
									name='join_link'
									value={formData.join_link || ''}
									onChange={handleChange}
									className={inputClass}
									placeholder={t('https://zoom.us/j/...')}
									required
								/>
							</div>
						</>
					)}

					{/* ---- FILE ATTACHMENT BLOCK ---- */}
					{type === 'file_attachment' && (
						<>
							<div>
								<label className={labelClass}>{t('Block Title:')}</label>
								<input
									type='text'
									name='title'
									value={formData.title || ''}
									onChange={handleChange}
									className={inputClass}
									placeholder={t('e.g. Course Materials')}
									required
								/>
							</div>
							<div>
								<label className={labelClass}>{t('Files:')}</label>
								<div
									className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors bg-[#fdfdfd] ${dragActive ? 'border-primary bg-primary/10' : 'border-border-color hover:border-primary-light hover:bg-primary/5'}`}
									onDragOver={(e) => {
										e.preventDefault()
										e.stopPropagation()
										setDragActive(true)
									}}
									onDragEnter={(e) => {
										e.preventDefault()
										e.stopPropagation()
										setDragActive(true)
									}}
									onDragLeave={(e) => {
										e.preventDefault()
										e.stopPropagation()
										setDragActive(false)
									}}
									onDrop={(e) => {
										e.preventDefault()
										e.stopPropagation()
										setDragActive(false)
										handleFilesSelected(e.dataTransfer.files)
									}}
									onClick={() => fileInputRef.current?.click()}
								>
									<input
										ref={fileInputRef}
										type='file'
										multiple
										style={{ display: 'none' }}
										onChange={(e) => handleFilesSelected(e.target.files)}
									/>
									<div className='flex flex-col items-center justify-center text-gray-500 h-full'>
										<svg
											width='40'
											height='40'
											viewBox='0 0 24 24'
											fill='none'
											stroke='#9484b4'
											strokeWidth='1.5'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
											<polyline points='17 8 12 3 7 8' />
											<line x1='12' y1='3' x2='12' y2='15' />
										</svg>
										<p className='mt-2 font-medium text-primary'>
											{t('Drag & drop files here')}
										</p>
										<p className='text-[0.85rem] text-gray-400 mt-1'>
											{t('or click to browse')}
										</p>
									</div>
								</div>

								{/* Selected files list */}
								{formData.files && formData.files.length > 0 && (
									<ul className='mt-4 list-none p-0 flex flex-col gap-2'>
										{formData.files.map((file, idx) => (
											<li
												key={idx}
												className='flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10'
											>
												<span className='font-medium text-gray-800 truncate max-w-[200px] md:max-w-xs'>
													{file.name}
												</span>
												<span className='text-sm text-gray-500 ml-auto mr-4'>
													{formatFileSize(file.size)}
												</span>
												<button
													type='button'
													className='text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors'
													onClick={(e) => {
														e.stopPropagation()
														removeFile(idx)
													}}
													title={t('Remove file')}
												>
													<X size={18} />
												</button>
											</li>
										))}
									</ul>
								)}
							</div>
						</>
					)}

					{/* ---- RECORDING / LINK EMBED BLOCK ---- */}
					{type === 'recording_link' && (
						<>
							<div>
								<label className={labelClass}>{t('Link Title:')}</label>
								<input
									type='text'
									name='title'
									value={formData.title || ''}
									onChange={handleChange}
									className={inputClass}
									placeholder={t('e.g. Class Recording - Week 1')}
									required
								/>
							</div>
							<div>
								<label className={labelClass}>{t('URL:')}</label>
								<input
									type='url'
									name='url'
									value={formData.url || ''}
									onChange={handleChange}
									className={inputClass}
									placeholder={t('https://example.com/recording')}
									required
								/>
							</div>
							<div>
								<label className={labelClass}>
									{t('Description (optional):')}
								</label>
								<textarea
									name='description'
									value={formData.description || ''}
									onChange={handleChange}
									className={`${inputClass} min-h-[80px]`}
									rows={2}
									placeholder={t('Brief description of the link...')}
								/>
							</div>
						</>
					)}

					<div className='flex flex-col sm:flex-row gap-4 pt-4 border-t border-border-color'>
						<button
							type='submit'
							disabled={saving}
							className={`inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#514587] text-white border-none transition-opacity flex-1 ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
						>
							{saving ? (
								<Loader2 size={18} className='mr-2 animate-spin' />
							) : (
								<Save size={18} className='mr-2' />
							)}
							{saving ? t('Saving...') : t('Save Block')}
						</button>
						<button
							type='button'
							onClick={onClose}
							className='inline-flex items-center justify-center p-[0.8rem_1.15rem] rounded-full font-bold bg-[#EBE8F5] text-[#4f4965] border-none transition-opacity hover:opacity-90 flex-1 cursor-pointer'
						>
							{t('Cancel')}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default BlockEditorModal
