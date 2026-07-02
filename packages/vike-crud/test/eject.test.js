// Tier-3 customization: eject a view to owned source. These cover the pure codegen — file
// layout, the inlined view descriptor, scope emitted from the real function, per-framework page,
// and a real `node --check` syntax pass on the generated (plain-JS) data hook. End-to-end proof
// that an ejected page actually renders + writes lives in examples/vike-crud (pages/posts-ejected).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ejectView, routeToSlug } from '../eject.js'
import { definePage, crudBlocks, column, field } from '../index.js'

function postsView() {
  return definePage({
    route: '/posts',
    sections: crudBlocks({
      table: 'posts',
      list: [column('title').sortable().searchable(), column('published')],
      form: [field('title').required(), field('body')],
    }),
    scope: (table, ctx) => ({ user_id: ctx.user.id }),
  })
}

test('routeToSlug: routes -> folder slugs', () => {
  assert.equal(routeToSlug('/posts'), 'posts')
  assert.equal(routeToSlug('/'), 'home')
  assert.equal(routeToSlug('/admin/posts'), 'admin-posts')
  assert.equal(routeToSlug('/posts/@id'), 'posts-id')
  assert.equal(routeToSlug(''), 'view')
})

test('ejectView (react): two files at the route folder', () => {
  const out = ejectView(postsView())
  assert.equal(out.route, '/posts')
  assert.equal(out.slug, 'posts')
  assert.equal(out.dir, 'pages/posts')
  const paths = out.files.map((f) => f.path)
  assert.deepEqual(paths, ['pages/posts/+data.js', 'pages/posts/+Page.jsx'])
})

test('ejectView: the data hook inlines the view descriptor + route', () => {
  const data = ejectView(postsView()).files[0].source
  assert.match(data, /const ROUTE = '\/posts'/)
  assert.match(data, /const view = definePage\(/)
  // sections emitted as the serializable IR the developer now edits
  assert.match(data, /block: 'list'/)
  assert.match(data, /block: 'form'/)
  assert.match(data, /table: 'posts'/)
  // no page-gen indirection: imports the core write/read surface, owns its POST + redirect
  assert.match(data, /from 'vike-crud'/)
  assert.match(data, /hydrateView/)
  assert.match(data, /createRow/)
  assert.match(data, /throw redirect\(ROUTE\)/)
})

test('ejectView: scope is emitted from the real function source', () => {
  const data = ejectView(postsView()).files[0].source
  assert.match(data, /const scope = \(table, ctx\) => \(\{ user_id: ctx\.user\.id \}\)/)
})

test('ejectView: a view with no scope emits `const scope = undefined`', () => {
  const view = definePage({ route: '/notes', sections: crudBlocks({ table: 'notes' }) })
  const data = ejectView(view).files[0].source
  assert.match(data, /const scope = undefined/)
})

test('ejectView (vue): emits a .vue SFC page', () => {
  const out = ejectView(postsView(), { framework: 'vue' })
  assert.deepEqual(out.files.map((f) => f.path), ['pages/posts/+data.js', 'pages/posts/+Page.vue'])
  const page = out.files[1].source
  assert.match(page, /<script setup>/)
  assert.match(page, /from 'vike-vue\/useData'/)
  assert.match(page, /from 'vike-crud\/vue'/)
  assert.match(page, /<Blocks :sections="sections" \/>/)
})

test('ejectView (react): the page renders sections through <Blocks>', () => {
  const page = ejectView(postsView()).files[1].source
  assert.match(page, /from 'vike-react\/useData'/)
  assert.match(page, /from 'vike-crud\/react'/)
  assert.match(page, /export default function Page\(\)/)
  assert.match(page, /<Blocks sections=\{sections\}/)
})

test('ejectView: pkg option rewrites the import specifier', () => {
  const out = ejectView(postsView(), { pkg: '@acme/views' })
  assert.match(out.files[0].source, /from '@acme\/views'/)
  assert.match(out.files[1].source, /from '@acme\/views\/react'/)
})

test('ejectView: slug option overrides the folder', () => {
  const out = ejectView(postsView(), { slug: 'my-posts' })
  assert.equal(out.dir, 'pages/my-posts')
  assert.equal(out.files[0].path, 'pages/my-posts/+data.js')
})

test('ejectView: rejects non-view input', () => {
  assert.throws(() => ejectView(null), /expected a view/)
  assert.throws(() => ejectView({}), /expected a view/)
  assert.throws(() => ejectView(postsView(), { framework: 'svelte' }), /unknown framework/)
})

test('ejectView: a function leaking into a section fails loudly (IR guardrail)', () => {
  const view = { route: '/x', sections: [{ block: 'custom', render: () => 1 }] }
  assert.throws(() => ejectView(view), /must be serializable/)
})

test('generated +data.js is syntactically valid JS (node --check)', () => {
  const data = ejectView(postsView()).files[0].source
  const dir = mkdtempSync(join(tmpdir(), 'eject-'))
  const file = join(dir, 'gen.mjs')
  try {
    writeFileSync(file, data)
    // Throws (non-zero exit) on a syntax error; passes silently on valid ESM.
    execFileSync(process.execPath, ['--check', file])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
