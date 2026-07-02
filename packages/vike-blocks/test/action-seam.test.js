// The actions seam (#385): a button/form carries a serializable action REFERENCE (a name + params /
// onSubmit), never an inline closure. The renderers wire it to an injected runner (react/vue
// action-context, not node:test-tested here). This covers the agnostic half: the builders collapse
// the reference onto the descriptor, and resolve passes it through unchanged.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { button, form, field, input, definePage, resolvePage, getBlock } from '../index.js'

test('button carries an action name + params on the descriptor', () => {
  assert.deepEqual(button('Publish').action('publish').build(), { block: 'button', label: 'Publish', action: 'publish' })
  assert.deepEqual(button('Publish').action('publish').params({ id: '$row.id' }).build(), {
    block: 'button',
    label: 'Publish',
    action: 'publish',
    params: { id: '$row.id' },
  })
})

test('a plain (no-action) button is unchanged — the seam is purely additive', () => {
  assert.deepEqual(button('Save').build(), { block: 'button', label: 'Save' })
  assert.equal('action' in button('Save').build(), false)
})

test('the action reference is serializable data (no function on the descriptor)', () => {
  const d = button('Go').action('go').params({ n: 1 }).build()
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(d)))
})

test('button action/params survive resolve as pass-through props', () => {
  const out = resolvePage(definePage({ sections: [button('Publish').action('publish').params({ id: 1 })] }))
  assert.deepEqual(out.sections[0].resolved, { label: 'Publish', action: 'publish', params: { id: 1 } })
})

test('form.onSubmit sets a named submit action, distinct from the native action URL', () => {
  const d = form({ action: '/members' }).onSubmit('createMember').build()
  assert.equal(d.action, '/members') // native fallback URL preserved
  assert.equal(d.onSubmit, 'createMember') // named action for the JS path
})

test('form resolve exposes onSubmit (null when unset)', () => {
  const resolveForm = (b) => getBlock('form').resolve({ props: b.build() })
  assert.equal(resolveForm(form()).onSubmit, null)
  assert.equal(resolveForm(form().onSubmit('save').fields([field('N').control(input().name('n'))])).onSubmit, 'save')
})
