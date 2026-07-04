<script setup>
// The dropdown block through the Vue renderer — a menu on the shared popover primitive (anchored, no
// backdrop, no scroll-lock). Worth clicking: open then close (item click / outside / Escape) — the
// outside-close listeners and focus-restore should ride the exit, not fire immediately. The `.side('top')`
// menu exercises the edge-aware placement (it flips up near the viewport bottom).
import { Page } from 'vike-blocks/vue'
import { definePage, dropdown, heading, text } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Dropdown block').level(1),
    text('A trigger opens a floating menu anchored to it. Click an item (a link when .item(label, { to }) is set, else a button) to run it and close; outside-click or Escape closes.').tone('muted'),

    heading('Account menu').level(3),
    dropdown('Account')
      .heading('Signed in as jane@acme.com')
      .item('Profile', { to: '/' })
      .item('Settings', { to: '/' })
      .separator()
      .item('Sign out'),

    heading('Disabled item').level(3),
    dropdown('Actions').item('Rename').item('Duplicate').separator().item('Delete', { disabled: true }),

    heading('Opens upward (.side(\'top\'))').level(3),
    text('Anchored above the trigger; the popover also flips automatically when it would overflow the viewport.').tone('muted'),
    dropdown('Open up').item('One').item('Two').item('Three').side('top'),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
