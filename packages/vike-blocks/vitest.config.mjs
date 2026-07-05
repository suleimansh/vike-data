import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Render-test harness for the react + vue renderers (jsdom). Separate from the
// node:test logic suites (test/*.test.js, run via `pnpm test`). The vue renderers are
// plain render functions (no SFC), so only the React JSX transform is needed.
export default defineConfig({
  plugins: [react({ include: [/\.jsx$/] })],
  test: {
    environment: 'jsdom',
    include: ['render-tests/**/*.{js,jsx}'],
    globals: true,
  },
})
