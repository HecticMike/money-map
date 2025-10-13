import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect if running in GitHub Actions
const isActions = process.env.GITHUB_ACTIONS || false
const repository = 'money-map' // your repo name

export default defineConfig({
  plugins: [react()],
  base: isActions ? `/${repository}/` : '/',
})
