// The layout core resolves an app's selection + slot config into a normalized
// descriptor the (per-framework) shells render from. Pin that contract.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shells, registerShell, isAppShell, defineLayout, isActivePath } from '../index.js'
import config from '../+config.js'

test('ships the three preset shells with kinds', () => {
  const s = shells()
  assert.equal(s.centered.kind, 'public')
  assert.equal(s.topbar.kind, 'app')
  assert.equal(s.sidebar.kind, 'app')
})

test('isAppShell distinguishes app chrome from public shells', () => {
  assert.equal(isAppShell('topbar'), true)
  assert.equal(isAppShell('centered'), false)
  assert.equal(isAppShell('nope'), false)
})

test('defineLayout defaults to the centered public shell', () => {
  const l = defineLayout()
  assert.equal(l.shell, 'centered')
  assert.equal(l.kind, 'public')
  // dir is unset by default so the shell INHERITS the document direction
  // (owned by the active locale via vike-i18n's <html dir>, #54).
  assert.equal(l.dir, undefined)
})

test('an unknown shell falls back to centered', () => {
  assert.equal(defineLayout({ shell: 'hologram' }).shell, 'centered')
})

test('defineLayout forces direction only when explicitly rtl/ltr, else inherits', () => {
  assert.equal(defineLayout({ dir: 'rtl' }).dir, 'rtl')
  assert.equal(defineLayout({ dir: 'ltr' }).dir, 'ltr')
  assert.equal(defineLayout({ dir: 'bogus' }).dir, undefined) // inherit, don't force ltr
})

test('an app shell keeps the slots it renders', () => {
  const nav = [{ label: 'Home', href: '/' }]
  const l = defineLayout({ shell: 'topbar', logo: 'Acme', nav, userMenu: 'menu', footer: ['x'] })
  assert.equal(l.slots.logo, 'Acme')
  assert.deepEqual(l.slots.nav, nav)
  assert.equal(l.slots.userMenu, 'menu')
  assert.deepEqual(l.slots.footer, ['x'])
})

test('the centered shell ignores app-only slots (nav/userMenu/footer)', () => {
  const l = defineLayout({ shell: 'centered', logo: 'Acme', nav: [{ label: 'X', href: '/x' }], userMenu: 'm' })
  assert.equal(l.slots.logo, 'Acme') // centered renders logo
  assert.deepEqual(l.slots.nav, []) // but not nav
  assert.equal(l.slots.userMenu, null)
})

test('registerShell adds a 4th shell (open registry)', () => {
  registerShell('split', { kind: 'app', slots: ['logo', 'nav'] })
  assert.equal(isAppShell('split'), true)
  const l = defineLayout({ shell: 'split', logo: 'L', nav: [{ label: 'A', href: '/a' }], userMenu: 'ignored' })
  assert.equal(l.shell, 'split')
  assert.equal(l.slots.userMenu, null) // not in this shell's slots
})

test('registerShell validates its arguments', () => {
  assert.throws(() => registerShell('', { slots: [] }), /non-empty string/)
  assert.throws(() => registerShell('x', {}), /slots must be an array/)
})

// isActivePath is now re-exported from vike-blocks (its canonical home + full
// matrix live there); this only pins that the re-export stays wired up.
test('re-exports isActivePath from vike-blocks', () => {
  assert.equal(typeof isActivePath, 'function')
  assert.equal(isActivePath('/admin/users', '/admin'), true)
  assert.equal(isActivePath('/chat', '/'), false)
})

test('+config declares the layout selection + slot config points', () => {
  assert.equal(config.meta.layout.env.client, true) // shell selection, client-available
  assert.equal(config.meta.nav.cumulative, true) // extensions can contribute nav links
  assert.equal(config.layout, 'centered') // safe public default
})

test('+config declares every slot defineLayout resolves (footer/userMenu/toolbar)', () => {
  // Without these meta keys Vike never collects the config values, so the slots
  // stay empty no matter what a page sets — the seam defineLayout resolves must
  // match the seam +config exposes.
  for (const key of ['footer', 'userMenu', 'toolbar']) {
    assert.ok(config.meta[key], `meta.${key} must be declared`)
    assert.equal(config.meta[key].env.client, true)
  }
  assert.equal(config.meta.footer.cumulative, true) // extensions can add footer links
  assert.equal(config.meta.toolbar.cumulative, true) // vike-toolbar contributes here
  assert.equal(config.meta.userMenu.cumulative, undefined) // single selection, like logo
})
