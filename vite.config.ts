import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd())

  return {
    base: env.VITE_APP_BASE,
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern'
        }
      }
    },
    plugins: [vue()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, 'src/')
      }
    }
  }
})
