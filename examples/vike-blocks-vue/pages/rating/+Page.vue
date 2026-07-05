<script setup>
// The rating block through the Vue renderer — a star rating. Hover to preview, click to set, arrow keys
// to adjust. The value is local state, seeded from .value(), so the server and the first client render
// show the same rating (no flash). Half-stars, a read-only display, and a hidden input for native
// submit. Same block descriptors as the React gallery; verifies the Vue twin renders identically.
import { Page } from 'vike-blocks/vue'
import { definePage, heading, text, rating, field } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Rating block').level(1),
    text('A star-rating control. Hover to preview, click to set, arrow keys to adjust. Half-stars, a read-only display, and a hidden input for native submit.').tone('muted'),

    heading('Interactive').level(3),
    rating('Rate your order').value(4).name('score'),

    heading('Half-star precision').level(3),
    rating('Half stars').value(3.5).allowHalf().name('half'),

    heading('Read-only display (a product average)').level(3),
    rating('Average').value(4.5).allowHalf().readOnly(),

    heading('Composed inside a field').level(3),
    field('How likely are you to recommend us?').control(rating().value(0).name('nps')),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
