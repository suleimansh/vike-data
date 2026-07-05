import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'

// The render-test harness for the react + vue bindings (jsdom). Kept separate from the
// node:test logic suites (test/*.test.js) — those still run via `pnpm test`. Component
// tests live in render-tests/ and run via `pnpm test:components`.
export default defineConfig({
  // Limit the React (babel/JSX) transform to .jsx so it never touches the .vue SFCs
  // or plain .js — plugin-vue owns .vue.
  plugins: [react({ include: [/\.jsx$/] }), vue()],
  test: {
    environment: 'jsdom',
    include: ['render-tests/**/*.{js,jsx}'],
    globals: true,
  },
})
