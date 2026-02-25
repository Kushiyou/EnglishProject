import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { config } from '@en/config'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server:{
    port: config.ports.web,
    open: true,
    //代理配置，将 /api 开头的请求转发到后端服务器，解决开发环境下的跨域问题
    proxy: {
      '/api': {
        target: `http://localhost:${config.ports.server}`,
        changeOrigin: true,
      },
      '/ai':{
        target: `http://localhost:${config.ports.ai}`,
        changeOrigin: true,
      }
    },
  }
})
