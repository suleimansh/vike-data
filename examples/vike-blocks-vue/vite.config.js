import vike from 'vike/plugin'
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [vike(), vue()],
  // vike-blocks ships plain .js Vue render-module source; serve it as source (not pre-bundled) so it
  // shares the app's Vue via the dedupe below (a second Vue copy breaks SSR on cross-copy vnodes).
  optimizeDeps: { exclude: ['vike-blocks'] },
  resolve: { dedupe: ['vue'] },
  // 4301: the React gallery (app-vike-blocks) holds 4300, so the twins can run side by side.
  server: { port: 4301, strictPort: true },
}
