import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { importQuizPlugin } from './import-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), importQuizPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
