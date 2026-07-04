// The empty-state block: a static container for the "no results / get started" case (registerBlock,
// type 'empty-state', builder `emptyState`) with a title + description + an optional custom icon block +
// action blocks. The renderers are not node:test-tested (JSX/Vue + the built-in SVG icon), so this
// covers the agnostic builder + resolve: the icon + actions collapse and resolve recursively, the copy
// passes through, and the empty defaults hold.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyState, button, avatar, definePage, resolvePage, hasBlock } from '../index.js'

test('empty-state is registered', () => {
  assert.ok(hasBlock('empty-state'))
})

test('the builder collapses copy + actions to a descriptor; omits absent parts', () => {
  const built = emptyState('No posts yet')
    .description('Create your first post to get started.')
    .actions([button('New post').variant('primary')])
    .build()
  assert.equal(built.block, 'empty-state')
  assert.equal(built.title, 'No posts yet')
  assert.equal(built.description, 'Create your first post to get started.')
  assert.equal(built.icon, undefined) // no custom icon -> renderer draws the built-in
  assert.equal(built.actions.length, 1)
  assert.equal(built.actions[0].block, 'button')
})

test('a custom icon block collapses', () => {
  const built = emptyState('Nobody here').icon(avatar().name('Ada Lovelace')).build()
  assert.equal(built.icon.block, 'avatar')
})

test('an empty-state with no actions omits the actions key', () => {
  const built = emptyState('Empty').build()
  assert.equal(built.actions, undefined)
  assert.equal(built.description, undefined)
})

test('resolves the title, description, icon, and action sections', () => {
  const out = resolvePage(
    definePage({ sections: [emptyState('No results').description('Try a different search.').actions([button('Clear filters')])] }),
  )
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'empty-state')
  assert.equal(r.title, 'No results')
  assert.equal(r.description, 'Try a different search.')
  assert.equal(r.icon, null)
  assert.equal(r.actions.length, 1)
  assert.equal(r.actions[0].block, 'button')
})

test('resolves a custom icon block into a view-model; empty defaults hold', () => {
  const out = resolvePage(definePage({ sections: [emptyState().icon(avatar().name('Grace Hopper'))] }))
  const r = out.sections[0].resolved
  assert.equal(r.title, '') // no title -> empty string, renderer skips it
  assert.equal(r.description, null)
  assert.equal(r.icon.block, 'avatar')
  assert.deepEqual(r.actions, [])
})
