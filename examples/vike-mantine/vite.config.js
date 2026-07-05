import vike from 'vike/plugin'

export default {
  plugins: [vike()],
  // vike-react uses the automatic JSX runtime, so no `import React` in components.
  esbuild: { jsx: 'automatic' },
  // vike-blocks ships plain .jsx source; serve it as source (not pre-bundled) so the JSX transform
  // applies and it shares the app's React via dedupe below. Mantine is a normal npm dep — let Vite
  // pre-bundle it as usual.
  optimizeDeps: { exclude: ['vike-blocks'] },
  // Share ONE React instance between the app, vike-blocks' components, and Mantine (workspace
  // packages resolve react from their own node_modules); otherwise SSR throws on cross-copy elements.
  resolve: { dedupe: ['react', 'react-dom', 'react/jsx-runtime'] },
  // 4300 = vike-blocks (react), 4301 = vike-blocks-vue; this sibling gets 4302.
  server: { port: 4302, strictPort: true },
}
