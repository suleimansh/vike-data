import vike from 'vike/plugin'

export default {
  plugins: [vike()],
  esbuild: { jsx: 'automatic' },
  // vike-admin + vike-auth ship plain .jsx source (their pages/components Vike pointer-imports);
  // serve them as source so the automatic-JSX transform applies instead of pre-bundling.
  optimizeDeps: { exclude: ['vike-admin', 'vike-auth', 'vike-blocks'] },
  resolve: { dedupe: ['react', 'react-dom', 'react/jsx-runtime'] },
  // Distinct from the other demos (react 4100, vue 4200, two-audience/vike-blocks 4300, vike-auth 4310).
  server: { port: 4320, strictPort: true },
}
