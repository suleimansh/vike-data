<script setup>
// The dialog block through the Vue renderer. A trigger opens a modal on the shared Overlay primitive
// (portal + focus trap + Escape + backdrop-click + scroll-lock). Worth clicking: on close, focus should
// return to the trigger AFTER the exit animation and the scrollbar shouldn't pop back until then.
import { Page } from 'vike-blocks/vue'
import { definePage, dialog, heading, text, button } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Dialog block').level(1),
    text('An interactive, theme-native modal — a trigger opens an overlay holding a composition of blocks. Focus trap, Escape, outside-click, and scroll-lock are built in, dep-free.').tone('muted'),

    heading('Confirm dialog').level(3),
    text('Open it, then close with Escape, a backdrop click, or the ×. Focus returns to the trigger after the close animation.').tone('muted'),
    dialog()
      .title('Delete post')
      .description('This action cannot be undone.')
      .trigger('Delete post')
      .sections([text('The post and all of its comments will be permanently removed.')])
      .footer([button('Cancel').variant('ghost'), button('Delete').variant('danger')]),

    heading('Nested blocks').level(3),
    text('A dialog body holds any blocks, so dialogs compose recursively like tabs and accordion.').tone('muted'),
    dialog()
      .title('About blocks')
      .trigger('Learn more')
      .sections([
        heading('Composable UI as data').level(4),
        text('A page is a composition of blocks. A container block (tabs, accordion, dialog) holds nested blocks, resolved recursively.'),
      ]),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
