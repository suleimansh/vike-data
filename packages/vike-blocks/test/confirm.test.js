// The confirm block: an alert dialog that guards a destructive action, built with a fluent builder
// (confirm('Delete').danger().action(href).field(...)). The renderer is not node:test-tested (JSX/Vue
// stateful, Overlay portal), so this covers the agnostic builder + the resolve (labels, intent, the
// form action + hidden fields, or a nav target).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { confirm, definePage, resolvePage, hasBlock } from '../index.js'

test('confirm is registered', () => {
  assert.ok(hasBlock('confirm'))
})

test('the builder collapses to a descriptor (form action + hidden fields + danger)', () => {
  assert.deepEqual(
    confirm('Delete').title('Delete this post?').description('This cannot be undone.').confirmLabel('Delete').danger().action('/posts/42').field('_action', 'delete').build(),
    {
      block: 'confirm',
      label: 'Delete',
      title: 'Delete this post?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      intent: 'danger',
      description: 'This cannot be undone.',
      action: { to: '/posts/42', method: 'post' },
      fields: [{ name: '_action', value: 'delete' }],
    },
  )
})

test('confirmLabel defaults to the trigger label; intent defaults to primary; method clamps', () => {
  const d = confirm('Sign out').to('/logout').build()
  assert.equal(d.confirmLabel, 'Sign out') // falls back to label
  assert.equal(d.intent, 'primary')
  assert.equal(d.to, '/logout')
  assert.equal(d.action, undefined)
  // a get action stays get; anything else clamps to post
  assert.equal(confirm('Go').action('/x', 'get').build().action.method, 'get')
  assert.equal(confirm('Go').action('/x', 'DELETE').build().action.method, 'post')
})

test('.link() marks a compact trigger; fields coerce values to strings', () => {
  const d = confirm('Delete').link().action('/x').field('id', 42).build()
  assert.equal(d.link, true)
  assert.deepEqual(d.fields, [{ name: 'id', value: '42' }])
})

test('resolve passes the confirmation through with defaults', () => {
  const out = resolvePage(definePage({ sections: [confirm('Remove').danger().action('/items/1').field('_action', 'delete')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'confirm')
  assert.equal(r.label, 'Remove')
  assert.equal(r.title, 'Are you sure?') // default title
  assert.equal(r.cancelLabel, 'Cancel')
  assert.equal(r.intent, 'danger')
  assert.deepEqual(r.action, { to: '/items/1', method: 'post' })
  assert.deepEqual(r.fields, [{ name: '_action', value: 'delete' }])
  assert.equal(r.to, null)
})

test('a bare confirm resolves to a display-only dialog (no action, no nav)', () => {
  const out = resolvePage(definePage({ sections: [confirm('OK')] }))
  const r = out.sections[0].resolved
  assert.equal(r.action, null)
  assert.equal(r.to, null)
  assert.deepEqual(r.fields, [])
})
