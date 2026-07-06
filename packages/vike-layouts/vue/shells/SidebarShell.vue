<!-- Sidebar app frame (Vue) — the twin of react/shells/SidebarShell.jsx. Since #401 a `layout`-block
     VARIANT arranging vike-blocks <SlotView> regions; registered into the block LayoutView by
     ../ConfigLayout. `end: true` nav items sink to the bottom above the user menu (#303). The nav is
     vertical, so its SlotViews pass `vertical`. -->
<script setup>
import { computed } from 'vue'
import { SlotView } from 'vike-blocks/vue/SlotView'
import { useLayoutConfig } from 'vike-blocks/vue/LayoutView'
const config = useLayoutConfig()
const dir = computed(() => config.value?.dir)
const logo = computed(() => config.value?.logo)
const footer = computed(() => config.value?.footer)
</script>
<template>
  <div :dir="dir" :style="{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }">
    <div :style="{ flex: 1, display: 'flex', minHeight: 0 }">
      <aside :style="{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 2rem)', padding: 'var(--space-lg, 2rem)', borderInlineEnd: '1px solid var(--color-border)', background: 'var(--color-surface)' }">
        <strong v-if="logo"><SlotView name="logo" from="config" /></strong>
        <SlotView name="nav" from="config" only="start" :vertical="true" />
        <div :style="{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 2rem)' }">
          <SlotView name="nav" from="config" only="end" :vertical="true" />
          <SlotView name="userMenu" from="config" />
        </div>
      </aside>
      <main :style="{ flex: 1, padding: 'var(--space-lg, 2rem)' }">
        <SlotView from="content" />
      </main>
    </div>
    <footer v-if="footer?.length > 0" :style="{ padding: 'var(--space-md, 1rem) var(--space-lg, 2rem)', borderTop: '1px solid var(--color-border)' }">
      <SlotView name="footer" from="config" />
    </footer>
  </div>
</template>
