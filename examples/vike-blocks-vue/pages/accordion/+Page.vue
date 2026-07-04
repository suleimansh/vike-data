<script setup>
// The accordion block through the Vue renderer. Single-open mode has CLOSED panels on load, which is
// the case that exercises the pre-hydration seed: a closed panel must render collapsed from first
// paint, not flash its content open then snap shut. Same block descriptors as the React gallery.
import { Page } from 'vike-blocks/vue'
import { definePage, accordion, heading, text, badge } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Accordion block').level(1),
    text('Expand/collapse sections with an animated height morph. Each panel is itself a composition of blocks.').tone('muted'),

    heading('Single-open (FAQ)').level(3),
    text('Opening one section closes the others. Only the first is open on load, so the rest should be collapsed from first paint (no flash-then-collapse).').tone('muted'),
    accordion()
      .item('overview', 'What is a block?', [
        text('A block is one section of a page — a { block, ...props } descriptor. A container block (tabs, accordion) holds nested blocks.'),
        badge('theme-native').tone('info'),
      ])
      .item('nested', 'Can a panel hold other blocks?', [text('Yes — a panel holds any blocks, resolved recursively. Composition all the way down.')])
      .item('animation', 'How does it animate without a library?', [
        text('The panel measures its natural height, then CSS-transitions between 0 and that height while fading in. Zero-dependency.'),
      ])
      .defaultValue('overview'),

    heading('Multi-open').level(3),
    text('Several sections can be open at once (mode set with .multiple()).').tone('muted'),
    accordion()
      .multiple()
      .item('shipping', 'Shipping', [text('Ships in 2-3 business days.')])
      .item('returns', 'Returns', [text('30-day returns, no questions asked.')])
      .item('warranty', 'Warranty', [text('One-year limited warranty on all parts.')])
      .defaultValue(['shipping', 'returns']),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
