// Custom shells + custom slots — the extensibility contract (grew out of spike #122).
//
// A layout is not a fixed set of shells or slots. Any package can register a new shell
// (registerShell) that declares its OWN slots, and defineLayout threads those slots exactly
// like the built-in logo/nav/footer/userMenu — no core change, no package split. This pins
// that story so the example app's custom "split" shell and its custom slot keep working.
//
// (vike-toolbar is deliberately NOT modelled as a layout slot: it composes through its own
// `toolbarItems` seam + a global wrapper. See its README and #693.)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defineLayout, registerShell, isAppShell } from '../index.js'

test('registerShell adds a shell that declares its own slots (open registry)', () => {
  registerShell('split', { kind: 'app', slots: ['logo', 'nav', 'aside'] })
  assert.equal(isAppShell('split'), true)
  const l = defineLayout({ shell: 'split', logo: 'Acme', nav: [{ label: 'Home', href: '/' }], aside: 'panel' })
  assert.equal(l.shell, 'split')
  assert.deepEqual(l.slots.nav, [{ label: 'Home', href: '/' }])
  assert.equal(l.slots.aside, 'panel') // the custom slot threads through like a built-in
})

test('a custom slot is opt-in per shell: a shell without it drops the value', () => {
  // A shell that did not declare `aside` never receives it, the same guarantee nav/userMenu
  // already have — so passing a slot a shell does not render is silently ignored.
  const l = defineLayout({ shell: 'topbar', aside: 'panel' })
  assert.equal('aside' in l.slots, false)
})

test('the public centered shell carries no app chrome', () => {
  // Auth/marketing pages use `centered` (logo only) and drop nav/userMenu/aside even if passed.
  const l = defineLayout({ shell: 'centered', logo: 'Acme', nav: [{ href: '/x' }], aside: 'panel' })
  assert.deepEqual(Object.keys(l.slots), ['logo'])
})

test('shell selection + built-in slots + a custom slot resolve in one descriptor', () => {
  // One defineLayout call resolves the shell, the cumulative nav, AND a custom slot together
  // — which is what a single (cumulative) vike-react Layout renders. No wrapper needed.
  registerShell('full', { kind: 'app', slots: ['logo', 'nav', 'aside'] })
  const l = defineLayout({
    shell: 'full',
    logo: 'Acme',
    nav: [{ label: 'Home', href: '/' }],
    aside: { title: 'Filters' },
  })
  assert.equal(l.shell, 'full')
  assert.deepEqual(l.slots.nav, [{ label: 'Home', href: '/' }])
  assert.deepEqual(l.slots.aside, { title: 'Filters' })
})
