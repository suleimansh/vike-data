import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'

// Render-test harness for the react + vue bindings (jsdom). Separate from the node:test
// logic suites (test/*.test.js, run via `pnpm test`). Component tests live in
// render-tests/ and run via `pnpm test:components`.
export default defineConfig({
  plugins: [react({ include: [/\.jsx$/] }), vue()],
  test: {
    environment: 'jsdom',
    include: ['render-tests/**/*.{js,jsx}'],
    globals: true,
  },
})
