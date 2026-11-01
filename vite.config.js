import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { templateCompilerOptions } from '@tresjs/core'

// Tresjs 要求把 templateCompilerOptions 透传给 vue 插件，
// 否则 <TresMesh> 等自定义渲染元素会在编译期产生告警/报错。
export default defineConfig({
  base: './',
  plugins: [
    vue({
      ...templateCompilerOptions,
    }),
    tailwindcss(),
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
  },
})
