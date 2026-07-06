import vike from 'vike/plugin'

export default {
  plugins: [vike()],
  // vike-react renders with the automatic JSX runtime, so no `import React` is needed.
  esbuild: { jsx: 'automatic' },
  // The workspace UI packages ship plain .jsx source; serve them as source (not pre-bundled)
  // so the automatic-JSX transform applies, and dedupe React so the app and the shells share
  // ONE React instance (a split copy crashes SSR with a null hooks dispatcher).
  optimizeDeps: {
    exclude: ['vike-blocks', 'vike-themes', 'vike-layouts', 'vike-toolbar'],
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  server: { port: 4210, strictPort: true },
}
