import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true,
			},
			'/login': {
				target: 'http://localhost:3001',
				changeOrigin: true,
			},
			'/profile': {
				target: 'http://localhost:3001',
				changeOrigin: true,
			},
		},
	},
})
