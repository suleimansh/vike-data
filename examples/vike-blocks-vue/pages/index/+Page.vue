<script setup>
// The gallery index. A plain Vue page (no blocks) linking to the interactive block demos — the ones
// whose Vue renderers have client behavior worth clicking (accordion height morph, dialog + dropdown
// open/close lifecycle). The Vue twin of app-vike-blocks' catalog, trimmed to the interactive set.
const demos = [
  { href: '/accordion', label: 'Accordion', note: 'Height-morph expand/collapse. Closed panels stay collapsed from first paint (no flash).' },
  { href: '/collapsible', label: 'Collapsible', note: 'Single-panel expand/collapse (the accordion sibling). Closed panels stay collapsed from first paint.' },
  { href: '/dialog', label: 'Dialog', note: 'Modal overlay: focus trap, Escape / backdrop / × close, scroll-lock. Focus returns after the exit.' },
  { href: '/dropdown', label: 'Dropdown', note: 'Anchored popover menu: edge-aware placement, outside-click / Escape close.' },
  { href: '/tree-view', label: 'Tree-view', note: 'Arbitrary-depth nested hierarchy: per-branch expand/collapse, .current auto-opens the active branch, roving arrow-key focus. Open state seeded so branches render correctly from first paint.' },
]
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text, #0f172a)' }">
    <h1 :style="{ fontSize: '28px', margin: '0 0 0.25rem' }">vike-blocks (Vue)</h1>
    <p :style="{ color: 'var(--color-muted, #64748b)', margin: '0 0 1.5rem' }">
      The Vue block renderers, rendered through <code>Page</code> from <code>vike-blocks/vue</code>. Same framework-agnostic block
      descriptors as the React gallery; different renderer.
    </p>
    <ul :style="{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }">
      <li v-for="d in demos" :key="d.href" :style="{ border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '10px', padding: '1rem' }">
        <a :href="d.href" :style="{ fontSize: '18px', fontWeight: 600, color: 'var(--color-primary, #2563eb)', textDecoration: 'none' }">{{ d.label }}</a>
        <p :style="{ margin: '0.35rem 0 0', fontSize: '14px', color: 'var(--color-muted, #64748b)' }">{{ d.note }}</p>
      </li>
    </ul>
  </div>
</template>
