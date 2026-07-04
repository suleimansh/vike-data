// walk.js — the nesting-aware section walk (#574). findSection locates a block at any depth (inside
// a card / tab / field), and mapSections deep-maps section nodes while keeping unchanged subtrees by
// reference. Pure logic over hand-built resolved sections (no resolvePage / db needed).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { walkSections, findSection, mapSections } from '../walk.js'

const form = { block: 'form', props: { table: 'posts' }, resolved: { fields: [{ name: 'title' }], values: {} } }
const card = { block: 'card', props: {}, resolved: { title: 'New', sections: [form], footer: null } }
const heading = { block: 'heading', props: {}, resolved: { value: 'Posts' } }
// A tabs-shaped container: children live under resolved.tabs[].sections, not resolved.sections.
const tabForm = { block: 'form', props: { table: 'comments' }, resolved: { fields: [] } }
const tabs = { block: 'tabs', props: {}, resolved: { tabs: [{ value: 'a', label: 'A', sections: [tabForm] }], activeValue: 'a' } }
const sections = () => [heading, card, tabs]

test('walkSections yields every section, containers before their children', () => {
  assert.deepEqual([...walkSections(sections())].map((s) => s.block), ['heading', 'card', 'form', 'tabs', 'form'])
})

test('findSection locates a block nested in a card', () => {
  assert.equal(findSection(sections(), (s) => s.block === 'form' && s.props.table === 'posts'), form)
})

test('findSection descends the tabs items[].sections shape too', () => {
  assert.equal(findSection(sections(), (s) => s.block === 'form' && s.props.table === 'comments'), tabForm)
})

test('findSection returns null when nothing matches', () => {
  assert.equal(findSection(sections(), (s) => s.block === 'record'), null)
})

test('mapSections replaces a nested section and rebuilds only the changed branch', async () => {
  const src = sections()
  const out = await mapSections(src, (s) => (s.block === 'form' && s.props.table === 'posts' ? { ...s, resolved: { ...s.resolved, values: { title: 'X' } } } : s))
  // the nested posts form got its new values
  assert.deepEqual(findSection(out, (s) => s.props?.table === 'posts').resolved.values, { title: 'X' })
  // the enclosing card is a new node (its children changed) but the untouched heading + tabs keep their refs
  assert.notEqual(out[1], src[1])
  assert.equal(out[0], src[0])
  assert.equal(out[2], src[2])
})

test('mapSections returns the same array reference when nothing changes', async () => {
  const src = sections()
  assert.equal(await mapSections(src, (s) => s), src)
})

test('mapSections is a no-op-safe deep walk (async fn, data props untouched)', async () => {
  const src = sections()
  const out = await mapSections(src, async (s) => s)
  assert.equal(out, src)
})
