import vike from 'vike/plugin'

export default {
  plugins: [vike()],
  // vike-react renders with the automatic JSX runtime (imports react/jsx-runtime),
  // so no `import React` is needed in components. Applies to app + workspace .jsx.
  esbuild: { jsx: 'automatic' },
  // vike-auth/react ships plain .jsx source (its /login + /account pages, the SignInForm /
  // UserButton components Vike pointer-imports); serve it as source so the automatic-JSX
  // transform applies instead of pre-bundling.
  optimizeDeps: { exclude: ['vike-auth'] },
  // Force ONE React copy: the workspace package has its own react peer link, so a
  // cross-copy element would otherwise crash SSR with a null useContext.
  resolve: { dedupe: ['react', 'react-dom', 'react/jsx-runtime'] },
  // Distinct from the other demos (react 4100, vue 4200, two-audience/vike-blocks 4300).
  server: { port: 4310, strictPort: true },
}
