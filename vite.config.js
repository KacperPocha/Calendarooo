import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['rsuite', 'hamburger-react'],
  },
  server: {
    fs: {
      strict: false, 
    },
  },
})
