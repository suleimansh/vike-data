<!-- <Layout> — the manual wrapper: pick a frame by name and render children inside it, for a page
     that mounts the shell itself instead of via the `layout:` config + ConfigLayout. Like the React
     twin (react/Layout.jsx) it renders through the block LayoutView, so both paths share one engine.
     Importing ./ConfigLayout.vue registers the topbar/sidebar variants (centered is the block builtin).
     A manual mount has no pageContext, so a config nav won't highlight here — use the `layout:` config
     path (ConfigLayout) when you want active-nav.

     Config comes in as attrs (logo/nav/footer/... + the shell name); `shells` is a per-call variant
     override map, and the page body is the default slot. A render-function component (not
     <script setup>) so it can hand the default-slot vnodes to LayoutView as `content`. -->
<script>
import { h } from 'vue'
import { LayoutConfigProvider, LayoutView } from 'vike-blocks/vue/LayoutView'
import { defineLayout } from '../index.js'
import './ConfigLayout.vue' // side-effect: registers the topbar/sidebar shells

export default {
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => {
      const { shells = {}, ...config } = attrs
      const resolved = defineLayout(config)
      const chrome = { ...resolved.slots, dir: resolved.dir }
      return h(LayoutConfigProvider, { config: chrome }, () =>
        h(LayoutView, { variant: resolved.shell, content: slots.default ? slots.default() : null, shells }),
      )
    }
  },
}
</script>
