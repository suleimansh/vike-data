<!-- Topbar app frame (Vue) — the twin of react/shells/TopbarShell.jsx. Since #401 a `layout`-block
     VARIANT: it arranges vike-blocks <SlotView> regions (chrome from the config seam, body from the
     live-content seam) instead of reading a `layout` prop. Registered into the block LayoutView by
     ../ConfigLayout. `end: true` nav items sit trailing next to the user menu (#303). -->
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
    <header :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg, 2rem)', padding: 'var(--space-md, 1rem) var(--space-lg, 2rem)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }">
      <div :style="{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg, 2rem)' }">
        <strong v-if="logo"><SlotView name="logo" from="config" /></strong>
        <SlotView name="nav" from="config" only="start" />
      </div>
      <div :style="{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg, 2rem)' }">
        <SlotView name="nav" from="config" only="end" />
        <SlotView name="userMenu" from="config" />
      </div>
    </header>
    <main :style="{ flex: 1, padding: 'var(--space-lg, 2rem)' }">
      <SlotView from="content" />
    </main>
    <footer v-if="footer?.length > 0" :style="{ padding: 'var(--space-md, 1rem) var(--space-lg, 2rem)', borderTop: '1px solid var(--color-border)' }">
      <SlotView name="footer" from="config" />
    </footer>
  </div>
</template>
