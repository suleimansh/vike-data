import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'

// Render-test harness for the react + vue slot hooks (jsdom). Separate from the node:test
// core suite (test/*.test.js, run via `pnpm test`). Component tests live in render-tests/
// and run via `pnpm test:components`.
export default defineConfig({
  // Limit the React (babel/JSX) transform to .jsx so it never touches the .vue SFCs or
  // plain .js — plugin-vue owns .vue.
  plugins: [react({ include: [/\.jsx$/] }), vue()],
  test: {
    environment: 'jsdom',
    include: ['render-tests/**/*.{js,jsx}'],
    globals: true,
  },
})
