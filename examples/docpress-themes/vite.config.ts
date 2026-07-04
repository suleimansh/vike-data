import vike from 'vike/plugin'

export default {
  plugins: [vike()],
  // vike-blocks' React renderers import react/react-dom as optional peers; dedupe so the app's single
  // React instance is used (otherwise a cross-package import can pull a second copy = a null dispatcher).
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  optimizeDeps: {
    // DocPress needs its search dep pre-bundled (mirrors the DocPress demo).
    include: ['@docsearch/react'],
    // Workspace UI packages ship ESM source (.js/.jsx); keep them out of the
    // pre-bundle so HMR + workspace symlinks resolve (same as the other examples).
    exclude: ['vike-themes', 'vike-theme-emerald', 'vike-blocks', 'vike-toolbar'],
  },
}
