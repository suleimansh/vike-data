<script setup>
// The stepper block through the Vue renderer — a multi-step wizard. Which step shows is local state,
// seeded from `current`, so the server and the first client render show the same step (no flash). The
// header marks complete / current / upcoming steps; click a step to jump, or use Back / Next. Each step
// composes any blocks (the last holds a real form). Same block descriptors as the React gallery.
import { Page } from 'vike-blocks/vue'
import { definePage, heading, text, stepper, field, input, form } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Stepper block').level(1),
    text('A multi-step wizard. Click a step in the header to jump, or use Back / Next. Each step composes any blocks; the last step holds a real form and Next is omitted so its submit finishes.').tone('muted'),

    stepper()
      .step('Account', [
        heading('Create your account').level(3),
        field('Email').control(input().type('email').placeholder('you@example.com')),
        field('Username').control(input().placeholder('ada')),
      ], { description: 'How we reach you' })
      .step('Profile', [
        heading('Tell us about you').level(3),
        field('Display name').control(input().placeholder('Ada Lovelace')),
      ], { description: 'Optional' })
      .step('Confirm', [
        heading('Review & submit').level(3),
        text('Everything look right? Submit to create your account.').tone('muted'),
        form({ action: '/signup', method: 'post' })
          .fields([field('Confirm email').control(input().type('email').placeholder('you@example.com'))])
          .submit('Create account'),
      ], { description: 'Finish up' }),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
