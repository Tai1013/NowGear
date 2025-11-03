import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // 生產環境使用 /NowGear/，開發環境使用 /
  const base = command === 'build' ? '/NowGear/' : '/'

  return {
    base,
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
