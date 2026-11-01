import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 用相对路径，方便 Capacitor(WebView) 与 Electron(file://) 直接加载
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5180 },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1500 }
})
