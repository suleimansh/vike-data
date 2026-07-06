<!-- The vike-vue Layout contributed by vike-layouts/vue. Reads the resolved layout config off
     pageContext and renders the matching app frame around the page.

     Since #401 the frames are `layout`-block VARIANTS: this builds the block LayoutView's inputs —
     the chosen variant, the chrome config (logo/nav/userMenu/footer/dir), and the live page content
     (the default slot) — and renders <LayoutView> wrapped in <LayoutConfigProvider>. The frames
     draw from those two seams via <SlotView>. App chrome and page-structure layouts share ONE
     engine; the config API (`layout:'topbar'`, nav, defineLayout) is unchanged. `currentPath` is
     passed in so a config nav highlights the active item without the block layer needing vike.

     A render-function component (not <script setup>) so it can hand the default-slot vnodes to
     LayoutView as `content`, reactively across client-side navigation. -->
<script>
import { computed, h } from 'vue'
import { usePageContext } from 'vike-vue/usePageContext'
import { LayoutConfigProvider, LayoutView, registerLayoutShell } from 'vike-blocks/vue/LayoutView'
import { defineLayout, shellSlotConfig } from '../index.js'
import TopbarShell from './shells/TopbarShell.vue'
import SidebarShell from './shells/SidebarShell.vue'

// Register the app frames as layout variants (centered is the block builtin, reused).
registerLayoutShell('topbar', TopbarShell)
registerLayoutShell('sidebar', SidebarShell)

export default {
  setup(_, { slots }) {
    const pageContext = usePageContext()
    const resolved = computed(() => {
      // Read every slot the chosen shell declares (built-in or custom) straight off config,
      // flattening the cumulative ones (they arrive as an array of per-source contributions).
      const config = pageContext.config || {}
      return defineLayout({ shell: config.layout, ...shellSlotConfig(config) })
    })
    const chrome = computed(() => ({ ...resolved.value.slots, dir: resolved.value.dir, currentPath: pageContext.urlPathname || '' }))
    return () =>
      h(LayoutConfigProvider, { config: chrome.value }, () => h(LayoutView, { variant: resolved.value.shell, content: slots.default ? slots.default() : null }))
  },
}
</script>
