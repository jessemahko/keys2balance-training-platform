const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/+$/, '')

const buildApiUrl = (path = '') => {
	if (!path) return API_BASE_URL
	return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export { API_BASE_URL, buildApiUrl }
