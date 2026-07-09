import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Must match the sub-path the site is served under. Project page named "mensaje-dai"
  // → '/mensaje-dai/'. If you serve it at the domain root instead, change this to '/'.
  base: '/mensaje-dai/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    passWithNoTests: true,
  },
})
