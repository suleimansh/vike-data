// The `layout` container block + the `slot` placeholder block (#401): a layout collapses into the
// same block IR as tabs/card — a container whose named regions are nested block compositions,
// resolved recursively. `slot` is a first-class placeholder whose `from` names its fill source
// (inline children vs a cumulative config contribution). Renderers (react/vue) are not
// node:test-tested (JSX); this covers the agnostic authoring + resolve.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { layout, slot, heading, text, button, definePage, resolvePage, hasBlock, listBlocks, isActivePath } from '../index.js'

test('layout and slot are registered blocks', () => {
  assert.ok(hasBlock('layout'))
  assert.ok(hasBlock('slot'))
})

test('the layout builder collapses to a descriptor with named slot regions, nested builders collapsed', () => {
  const desc = layout('landing')
    .slot('header', [button('Sign in')])
    .slot('main', [heading('Ship faster').level(1), text('Build schema-driven apps.')])
    .slot('footer', [text('(c) Acme')])
    .build()

  assert.equal(desc.block, 'layout')
  assert.equal(desc.variant, 'landing')
  assert.deepEqual(Object.keys(desc.slots), ['header', 'main', 'footer']) // insertion order preserved
  assert.deepEqual(desc.slots.main[0], { block: 'heading', value: 'Ship faster', level: 1 })
  assert.equal(desc.slots.footer[0].block, 'text')
})

test('.slots({...}) sets several regions at once; .variant() overrides', () => {
  const desc = layout()
    .variant('centered')
    .slots({ header: [heading('Welcome')], main: [text('Sign in to continue.')] })
    .build()

  assert.equal(desc.variant, 'centered')
  assert.deepEqual(Object.keys(desc.slots), ['header', 'main'])
})

test('layout resolves each region recursively into serializable view-models', () => {
  const page = definePage({
    route: '/',
    sections: [
      layout('landing')
        .slot('header', [button('Sign in')])
        .slot('main', [heading('Hi').level(2)]),
    ],
  })
  const resolved = resolvePage(page)

  assert.equal(resolved.sections.length, 1)
  const model = resolved.sections[0].resolved
  assert.equal(model.variant, 'landing')
  // each region is a resolved section list: { block, props, resolved }
  assert.equal(model.slots.main[0].block, 'heading')
  assert.equal(model.slots.main[0].resolved.value, 'Hi')
  assert.equal(model.slots.header[0].block, 'button')
})

test('a variant-less layout defaults to the neutral stack shell', () => {
  const model = resolvePage(definePage({ sections: [layout().slot('main', [text('x')])] })).sections[0].resolved
  assert.equal(model.variant, 'stack')
})

test('layouts compose recursively (a region can hold another layout)', () => {
  const model = resolvePage(
    definePage({ sections: [layout('landing').slot('main', [layout('centered').slot('main', [text('deep')])])] }),
  ).sections[0].resolved
  const inner = model.slots.main[0]
  assert.equal(inner.block, 'layout')
  assert.equal(inner.resolved.variant, 'centered')
  assert.equal(inner.resolved.slots.main[0].resolved.value, 'deep')
})

test('slot placeholder: from defaults to children and carries inline sections', () => {
  const desc = slot('main', [heading('Content')]).build()
  assert.equal(desc.block, 'slot')
  assert.equal(desc.name, 'main')
  assert.equal(desc.from, 'children')
  assert.equal(desc.sections[0].block, 'heading')
})

test("slot placeholder: from('config') names a source (defaulting to the slot name)", () => {
  const nav = slot('nav').from('config').build()
  assert.deepEqual(nav, { block: 'slot', name: 'nav', from: 'config' })

  const model = resolvePage(definePage({ sections: [slot('nav').from('config')] })).sections[0].resolved
  assert.equal(model.from, 'config')
  assert.equal(model.source, 'nav') // falls back to the slot's own name
  assert.deepEqual(model.sections, [])
})

test("slot placeholder: explicit .source() wins over the slot name", () => {
  const model = resolvePage(definePage({ sections: [slot('topbar').from('config').source('nav')] })).sections[0].resolved
  assert.equal(model.source, 'nav')
})

test('a config slot inside a layout region resolves without needing the config (fill is a render concern)', () => {
  const model = resolvePage(
    definePage({ sections: [layout('landing').slot('header', [slot('nav').from('config'), button('Sign in')])] }),
  ).sections[0].resolved
  assert.equal(model.slots.header[0].block, 'slot')
  assert.equal(model.slots.header[0].resolved.from, 'config')
  assert.equal(model.slots.header[1].block, 'button')
})

test('layout.slot rejects an empty name; slot() rejects an empty name', () => {
  assert.throws(() => layout().slot(''), /non-empty slot name/)
  assert.throws(() => slot(''), /non-empty name/)
})

test('layout and slot appear in the registry listing', () => {
  const all = listBlocks()
  assert.ok(all.includes('layout'))
  assert.ok(all.includes('slot'))
})

test("slot from('content') carries the content wiring (the live page body, filled by the renderer)", () => {
  const model = resolvePage(definePage({ sections: [slot('body').from('content')] })).sections[0].resolved
  assert.equal(model.from, 'content')
  assert.deepEqual(model.sections, [])
})

test("slot .only('start'|'end') is preserved on the descriptor and resolved model", () => {
  assert.equal(slot('nav').from('config').only('start').build().only, 'start')
  const model = resolvePage(definePage({ sections: [slot('nav').from('config').only('end')] })).sections[0].resolved
  assert.equal(model.only, 'end')
})

test('isActivePath: root is exact-match, others match self + descendants, trailing slash/query ignored', () => {
  assert.equal(isActivePath('/', '/'), true)
  assert.equal(isActivePath('/admin', '/'), false) // root does not light up everywhere
  assert.equal(isActivePath('/admin/users', '/admin'), true) // descendant
  assert.equal(isActivePath('/admin', '/admin'), true)
  assert.equal(isActivePath('/adminium', '/admin'), false) // prefix but not a path segment
  assert.equal(isActivePath('/admin/', '/admin'), true) // trailing slash ignored
  assert.equal(isActivePath('/admin?tab=1', '/admin'), true) // query ignored
  assert.equal(isActivePath('', '/admin'), false)
  assert.equal(isActivePath('/admin', ''), false)
})
