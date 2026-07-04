<script setup>
// The collapsible block through the Vue renderer — a single expand/collapse disclosure. Closed panels
// must render collapsed from first paint (no flash-then-collapse), which exercises the pre-hydration
// height seed. .open() starts one expanded. Same block descriptors as the React gallery.
import { Page } from 'vike-blocks/vue'
import { definePage, collapsible, heading, text, badge } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Collapsible block').level(1),
    text('A single expand/collapse disclosure — one trigger reveals one panel of nested blocks. The single-panel sibling of the accordion.').tone('muted'),

    heading('Closed by default').level(3),
    text('Closed panels stay collapsed from first paint (no flash-then-collapse).').tone('muted'),
    collapsible('What is a block?', [
      text('A block is one section of a page — a { block, ...props } descriptor. A container block holds nested blocks, resolved recursively.'),
      badge('theme-native').tone('info'),
    ]),
    collapsible('How does it animate without a library?', [
      text('The panel measures its natural height, then CSS-transitions between 0 and that height while fading in. Zero-dependency.'),
    ]),

    heading('Open by default').level(3),
    text('Call .open() to start expanded.').tone('muted'),
    collapsible('Shipping details', [text('Ships in 2-3 business days. Free returns within 30 days.')]).open(),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
