// The sheet container block: a fluent builder for an edge-anchored side panel that holds nested blocks,
// with a trigger, title/description, an anchored side, and an initial open state. Renderers (react/vue)
// are not node:test-tested (JSX/Vue + portal/DOM); this covers the agnostic authoring + resolve plus
// the shared per-side geometry module (container alignment, slide transform, corner radius).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sheet, text, input, field, definePage, resolvePage, hasBlock } from '../index.js'
import { sheetContainerStyle, sheetHiddenTransform, sheetPanelStyle } from '../sheet-styles.js'

test('sheet is registered', () => {
  assert.ok(hasBlock('sheet'))
})

test('the builder collapses to a descriptor, with nested section builders collapsed too', () => {
  const desc = sheet()
    .title('Filters')
    .description('Narrow the results.')
    .trigger('Filters')
    .side('left')
    .sections([field('Status').control(input()), text('More')])
    .build()

  assert.equal(desc.block, 'sheet')
  assert.equal(desc.title, 'Filters')
  assert.equal(desc.description, 'Narrow the results.')
  assert.equal(desc.trigger, 'Filters')
  assert.equal(desc.side, 'left')
  assert.equal(desc.sections[0].block, 'field') // nested builder collapsed to a descriptor
  assert.equal(desc.sections[1].block, 'text')
  assert.equal(desc.defaultOpen, undefined) // omitted unless set
})

test('side defaults to right and rejects an unknown side', () => {
  assert.equal(sheet().build().side, 'right')
  assert.equal(sheet().side('sideways').build().side, 'right') // unknown -> default
  assert.equal(sheet().side('bottom').build().side, 'bottom')
})

test('resolve fills the body recursively and defaults the chrome', () => {
  const out = resolvePage(definePage({ sections: [sheet().title('Hi').trigger('Open').sections([text('Body')])] }))
  const s = out.sections[0]
  assert.equal(s.block, 'sheet')
  assert.equal(s.resolved.title, 'Hi')
  assert.equal(s.resolved.trigger, 'Open')
  assert.equal(s.resolved.side, 'right')
  assert.equal(s.resolved.description, null)
  assert.equal(s.resolved.defaultOpen, false)
  assert.equal(s.resolved.sections[0].block, 'text')
  assert.deepEqual(s.resolved.sections[0].resolved, { value: 'Body' })
})

test('defaultOpen is carried through; a plain descriptor resolves too', () => {
  const desc = sheet().title('Auto').side('top').sections([text('x')]).defaultOpen().build()
  assert.equal(desc.defaultOpen, true)
  const out = resolvePage(definePage({ sections: [{ block: 'sheet', title: 'Raw', side: 'bottom', trigger: 'Go', sections: [{ block: 'text', value: 'hi' }] }] }))
  assert.equal(out.sections[0].resolved.title, 'Raw')
  assert.equal(out.sections[0].resolved.side, 'bottom')
  assert.equal(out.sections[0].resolved.sections[0].resolved.value, 'hi')
})

test('sheetContainerStyle anchors the panel to the requested edge', () => {
  assert.deepEqual(sheetContainerStyle('right'), { alignItems: 'stretch', justifyContent: 'flex-end' })
  assert.deepEqual(sheetContainerStyle('left'), { alignItems: 'stretch', justifyContent: 'flex-start' })
  assert.deepEqual(sheetContainerStyle('top'), { alignItems: 'flex-start', justifyContent: 'stretch' })
  assert.deepEqual(sheetContainerStyle('bottom'), { alignItems: 'flex-end', justifyContent: 'stretch' })
})

test('sheetHiddenTransform slides the panel fully off its anchored edge', () => {
  assert.equal(sheetHiddenTransform('right'), 'translateX(100%)')
  assert.equal(sheetHiddenTransform('left'), 'translateX(-100%)')
  assert.equal(sheetHiddenTransform('top'), 'translateY(-100%)')
  assert.equal(sheetHiddenTransform('bottom'), 'translateY(100%)')
})

test('sheetPanelStyle: full-height for a side, height-capped for top/bottom; slides to 0 when visible', () => {
  const right = sheetPanelStyle('right', true)
  assert.equal(right.height, '100%')
  assert.equal(right.maxWidth, '420px')
  assert.equal(right.transform, 'translate(0)') // visible -> in place
  const bottom = sheetPanelStyle('bottom', false)
  assert.equal(bottom.maxHeight, '85vh')
  assert.equal(bottom.transform, 'translateY(100%)') // hidden -> off the bottom edge
})
