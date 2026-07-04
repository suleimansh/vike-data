import vike from 'vike/plugin'

export default {
  plugins: [vike()],
  // vike-react uses the automatic JSX runtime, so no `import React` in components.
  esbuild: { jsx: 'automatic' },
  // vike-blocks + the UI packages ship plain .jsx source; serve them as source (not pre-bundled)
  // so the JSX transform applies and they share the app's React via dedupe below.
  optimizeDeps: { exclude: ['vike-blocks', 'vike-themes', 'vike-layouts', 'vike-toolbar'] },
  // Share ONE React instance between the app and vike-blocks' components (workspace packages
  // resolve react from their own node_modules); otherwise SSR throws on cross-copy elements.
  resolve: { dedupe: ['react', 'react-dom', 'react/jsx-runtime'] },
  server: { port: 4300, strictPort: true },
}
