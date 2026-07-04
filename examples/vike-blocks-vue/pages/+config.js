// vike-blocks is a plain library, not a Vike extension, so there is nothing to `extends` for it — the
// pages import <Page> and the block builders directly. We install only vike-vue here; the blocks ship
// CSS-var fallbacks, so they render themed-or-not without the UI tier (kept out to stay minimal — this
// gallery exists to EXERCISE the Vue block renderers, not to show the theming stack).
import vikeVue from 'vike-vue/config'

export default {
  extends: [vikeVue],
  title: 'vike-blocks (Vue)',
}
