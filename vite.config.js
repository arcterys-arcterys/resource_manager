import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'resource-manager' with your actual GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: '/resource-manager/',
})
