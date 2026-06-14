import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const config = defineConfig({
  base: '/iona-card-2026/',
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
    },
  },
  plugins: [TanStackRouterVite(), tailwindcss(), viteReact()],
})

export default config
