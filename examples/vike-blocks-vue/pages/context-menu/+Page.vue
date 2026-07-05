<script setup>
// The context-menu block through the Vue renderer — a right-click menu Teleported to <body> and pinned
// at the cursor. The menu is client + open-gated (Teleport behind a mounted flag), so SSR emits only the
// trigger region = no hydration mismatch. Right-click a region to open; it flips at the viewport edge
// and closes on outside-click / Escape / scroll. Same block descriptors as the React gallery.
import { Page } from 'vike-blocks/vue'
import { definePage, heading, text, card, contextMenu } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Context-menu block').level(1),
    text('A right-click menu anchored at the cursor — the last of the menu family. .on() wraps the right-click region; omit it for a default affordance box. Right-click the regions below.').tone('muted'),

    heading('Right-click a card').level(3),
    contextMenu()
      .heading('report.pdf')
      .item('Open', { to: '/files/report' })
      .item('Download', { to: '/files/report?dl=1' })
      .separator()
      .item('Rename')
      .item('Delete', { disabled: true })
      .on(card([text('📄 report.pdf'), text('Right-click for actions').tone('muted')]).title('Document')),

    heading('Default affordance (no .on())').level(3),
    contextMenu().item('Cut').item('Copy').item('Paste').separator().item('Select all'),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
