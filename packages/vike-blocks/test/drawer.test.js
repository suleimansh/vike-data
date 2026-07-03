// The drawer container block: a fluent builder for an edge-anchored panel with a drag-to-dismiss
// handle, holding nested blocks, with a trigger, title/description, an anchored side (default bottom),
// and an initial open state. Renderers (react/vue) are not node:test-tested (JSX/Vue + portal/pointer);
// this covers the agnostic authoring + resolve plus the shared drag math (dismiss offset/transform,
// the close threshold) and the handle geometry.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { drawer, item, text, definePage, resolvePage, hasBlock } from '../index.js'
import { dismissOffset, dismissTransform, shouldDismiss, drawerHandleStyle, DRAWER_CLOSE_THRESHOLD } from '../blocks/drawer-styles.js'

test('drawer is registered', () => {
  assert.ok(hasBlock('drawer'))
})

test('the builder collapses to a descriptor, with nested section builders collapsed too', () => {
  const desc = drawer().title('Quick actions').trigger('Menu').side('bottom').sections([item('Share'), text('More')]).build()
  assert.equal(desc.block, 'drawer')
  assert.equal(desc.title, 'Quick actions')
  assert.equal(desc.trigger, 'Menu')
  assert.equal(desc.side, 'bottom')
  assert.equal(desc.sections[0].block, 'item') // nested builder collapsed
  assert.equal(desc.sections[1].block, 'text')
  assert.equal(desc.defaultOpen, undefined) // omitted unless set
})

test('side defaults to bottom and rejects an unknown side', () => {
  assert.equal(drawer().build().side, 'bottom')
  assert.equal(drawer().side('sideways').build().side, 'bottom') // unknown -> default
  assert.equal(drawer().side('right').build().side, 'right')
})

test('resolve fills the body recursively and defaults the chrome', () => {
  const out = resolvePage(definePage({ sections: [drawer().title('Hi').trigger('Open').sections([text('Body')])] }))
  const d = out.sections[0]
  assert.equal(d.block, 'drawer')
  assert.equal(d.resolved.title, 'Hi')
  assert.equal(d.resolved.side, 'bottom')
  assert.equal(d.resolved.description, null)
  assert.equal(d.resolved.defaultOpen, false)
  assert.equal(d.resolved.sections[0].block, 'text')
  assert.deepEqual(d.resolved.sections[0].resolved, { value: 'Body' })
})

test('dismissOffset measures the drag toward the anchored edge only (never negative)', () => {
  assert.equal(dismissOffset('bottom', 0, 40), 40) // drag down dismisses a bottom drawer
  assert.equal(dismissOffset('bottom', 0, -40), 0) // drag up does nothing
  assert.equal(dismissOffset('top', 0, -40), 40) // drag up dismisses a top drawer
  assert.equal(dismissOffset('right', 40, 0), 40) // drag right dismisses a right drawer
  assert.equal(dismissOffset('left', -40, 0), 40) // drag left dismisses a left drawer
  assert.equal(dismissOffset('left', 40, 0), 0) // wrong direction -> 0
})

test('dismissTransform follows the finger along the dismiss axis', () => {
  assert.equal(dismissTransform('bottom', 30), 'translateY(30px)')
  assert.equal(dismissTransform('top', 30), 'translateY(-30px)')
  assert.equal(dismissTransform('right', 30), 'translateX(30px)')
  assert.equal(dismissTransform('left', 30), 'translateX(-30px)')
})

test('shouldDismiss only past the close threshold', () => {
  assert.equal(shouldDismiss(DRAWER_CLOSE_THRESHOLD - 1), false)
  assert.equal(shouldDismiss(DRAWER_CLOSE_THRESHOLD), true)
  assert.equal(shouldDismiss(500), true)
})

test('drawerHandleStyle is a horizontal bar for top/bottom, vertical for left/right', () => {
  const bottom = drawerHandleStyle('bottom')
  assert.equal(bottom.width, '2.25rem')
  assert.equal(bottom.height, '0.3rem')
  const right = drawerHandleStyle('right')
  assert.equal(right.width, '0.3rem')
  assert.equal(right.height, '2.25rem')
  assert.equal(bottom.cursor, 'grab')
})
