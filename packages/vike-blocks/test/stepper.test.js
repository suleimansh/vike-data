// The stepper block: a fluent builder for a multi-step wizard whose steps compose nested blocks
// (resolved recursively), with a clamped initial step. Renderers (react/vue) are DOM-only (step state +
// nav) and are not node:test-tested; this covers the agnostic authoring + resolve + the stepState map.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stepper, field, input, text, heading, definePage, resolvePage, hasBlock } from '../index.js'
import { stepState } from '../blocks/stepper-styles.js'

test('stepper is registered', () => {
  assert.ok(hasBlock('stepper'))
})

test('the builder collapses to a descriptor; a step\'s nested sections collapse too', () => {
  const desc = stepper()
    .step('Account', [heading('Account').level(3)], { description: 'Your details' })
    .step('Review', [text('Confirm.')])
    .current(1)
    .nextLabel('Continue')
    .build()
  assert.equal(desc.block, 'stepper')
  assert.equal(desc.current, 1)
  assert.equal(desc.nextLabel, 'Continue')
  assert.deepEqual(desc.steps[0], { title: 'Account', description: 'Your details', sections: [{ block: 'heading', value: 'Account', level: 3 }] })
  assert.equal('description' in desc.steps[1], false) // no description key when omitted
})

test('omitting current / labels leaves those keys off the descriptor', () => {
  const desc = stepper().step('One', [text('x')]).build()
  assert.equal('current' in desc, false)
  assert.equal('nextLabel' in desc, false)
  assert.equal('backLabel' in desc, false)
})

test('resolve fills each step recursively and defaults current + labels', () => {
  const out = resolvePage(definePage({ sections: [stepper().step('A', [field('Email').control(input())]).step('B', [text('done')])] }))
  const r = out.sections[0].resolved
  assert.equal(r.current, 0)
  assert.equal(r.nextLabel, 'Next')
  assert.equal(r.backLabel, 'Back')
  assert.equal(r.steps.length, 2)
  assert.equal(r.steps[0].title, 'A')
  assert.equal(r.steps[0].description, null)
  assert.equal(r.steps[0].sections[0].block, 'field')
})

test('resolve clamps the initial step into range (over and under)', () => {
  const over = resolvePage(definePage({ sections: [stepper().step('A', []).step('B', []).current(9)] })).sections[0].resolved
  assert.equal(over.current, 1) // clamped to last
  const under = resolvePage(definePage({ sections: [stepper().step('A', []).step('B', []).current(-3)] })).sections[0].resolved
  assert.equal(under.current, 0)
})

test('stepState labels a step complete / current / upcoming relative to the active step', () => {
  assert.equal(stepState(0, 2), 'complete')
  assert.equal(stepState(1, 2), 'complete')
  assert.equal(stepState(2, 2), 'current')
  assert.equal(stepState(3, 2), 'upcoming')
})
