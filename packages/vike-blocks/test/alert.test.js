// The alert leaf block: a fluent builder for a tone-styled notice. A pass-through block (its resolved
// model is its props). Renderers (react/vue) are not node:test-tested (JSX/Vue); this covers the
// agnostic authoring + resolve.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { alert, definePage, resolvePage, hasBlock } from '../index.js'
import { intentKey, alertStyles, INTENTS } from '../blocks/alert-styles.js'

test('alert is registered', () => {
  assert.ok(hasBlock('alert'))
})

test('the builder collapses to a descriptor', () => {
  assert.deepEqual(alert('Heads up').intent('warning').body('Trial ends soon.').build(), {
    block: 'alert',
    title: 'Heads up',
    intent: 'warning',
    body: 'Trial ends soon.',
  })
})

test('title-only and intent-only forms build', () => {
  assert.deepEqual(alert('Saved').intent('success').build(), { block: 'alert', title: 'Saved', intent: 'success' })
  assert.deepEqual(alert('Note').build(), { block: 'alert', title: 'Note' })
})

test('resolve is a pass-through (model = props minus block type)', () => {
  const out = resolvePage(definePage({ sections: [alert('Hi').intent('info').body('there')] }))
  const a = out.sections[0]
  assert.equal(a.block, 'alert')
  assert.deepEqual(a.resolved, { title: 'Hi', intent: 'info', body: 'there' })
})

test('a plain descriptor (no builder) resolves too', () => {
  const out = resolvePage(definePage({ sections: [{ block: 'alert', title: 'Raw', intent: 'danger' }] }))
  assert.deepEqual(out.sections[0].resolved, { title: 'Raw', intent: 'danger' })
})

test('intentKey normalizes aliases and unknowns to a canonical intent', () => {
  assert.equal(intentKey('warn'), 'warning')
  assert.equal(intentKey('error'), 'danger')
  assert.equal(intentKey('note'), 'info')
  assert.equal(intentKey('success'), 'success') // a canonical name is unchanged
  assert.equal(intentKey('bogus'), 'info') // unknown -> info
  assert.equal(intentKey(undefined), 'info') // unset -> info
})

test('the shadcn Radix surface is bordered (not tinted); only danger is destructive', () => {
  const info = alertStyles('info')
  // bordered box, background is the plain page bg (no color-mix tint like the old version)
  assert.match(info.box.border, /1px solid/)
  assert.equal(info.box.background, 'var(--color-bg, #ffffff)')
  assert.equal(info.box.border, '1px solid var(--color-border, #e2e8f0)') // neutral border
  assert.equal(info.titleStyle.color, 'var(--color-text, #0f172a)') // neutral title

  const danger = alertStyles('danger')
  assert.match(danger.box.border, /color-mix/) // destructive: accent-tinted border
  assert.equal(danger.titleStyle.color, INTENTS.danger.accent) // destructive title in accent
  assert.equal(danger.iconStyle.color, INTENTS.danger.accent)
})
