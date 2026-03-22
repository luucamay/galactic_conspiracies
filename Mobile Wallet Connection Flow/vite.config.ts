import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig(({ command }) => ({
  // Serve from /mobile in production (Node web-server), keep root during local Vite dev.
  base: command === 'build' ? '/mobile/' : '/',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used - do not remove them
    react(),
    tailwindcss(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // sodium-universal resolves to Node native bindings; shim for browser builds.
      'sodium-universal': path.resolve(__dirname, './src/sodium-shim.js'),
    },
  },
  build: {
    // Emit into the backend-served static folder.
    outDir: '../web/mobile',
    emptyOutDir: true,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))
