import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Se tiver a linha abaixo com ponto, CORRIJA:
  build: {
    outDir: 'dist', // SEM O PONTO!
  }
})