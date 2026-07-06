// vike-layouts — the framework-agnostic LAYOUT core.
//
// Layout and theme are orthogonal (issue #25): layout is WHERE things go (logo,
// nav, footer, user menu placement); theme is HOW it looks (#24, vike-themes).
// A sidebar layout + dark theme compose, as do a centered layout + light theme.
//
// This core owns only the framework-agnostic half: the shell REGISTRY (which
// shells exist and which slots each renders) and the SELECTION + SLOT config an
// app provides. The actual shell components are per-framework UI and live in a
// subpath (vike-layouts/react) — exactly the core/UI split the rest of the Stem
// set uses, so a future vike-layouts/vue reuses this selection logic unchanged.

// kind: 'public' shells (logo only, no app nav) bridge to auth/marketing pages;
// 'app' shells carry the signed-in chrome. slots: which slots the shell renders.
const SHELLS = {
  // centered/blank — public + auth pages: a clean centered card, logo only. This
  // is exactly what vike-auth/react's login page wants.
  centered: { kind: 'public', slots: ['logo'] },
  // topbar — app shell: horizontal nav across the top.
  topbar: { kind: 'app', slots: ['logo', 'nav', 'userMenu', 'footer'] },
  // sidebar — app shell: vertical nav down the side.
  sidebar: { kind: 'app', slots: ['logo', 'nav', 'userMenu', 'footer'] },
}

/** The registered shells (a copy — mutate via registerShell, not this object). */
export function shells() {
  return { ...SHELLS }
}

/**
 * Register a shell so a third-party package can add a 4th (the registry is kept
 * OPEN on purpose — #25). `spec` = { kind: 'app'|'public', slots: string[] }.
 */
export function registerShell(name, spec) {
  if (!name || typeof name !== 'string') throw new Error('[vike-layouts] registerShell: name must be a non-empty string')
  if (!spec || !Array.isArray(spec.slots)) throw new Error('[vike-layouts] registerShell: spec.slots must be an array')
  SHELLS[name] = { kind: spec.kind === 'app' ? 'app' : 'public', slots: [...spec.slots] }
  return SHELLS[name]
}

/** True if `name` is an app (signed-in chrome) shell rather than a public one. */
export function isAppShell(name) {
  return SHELLS[name]?.kind === 'app'
}

// Slots whose value is a CUMULATIVE list (many sources contribute), so they default to
// [] when unset; every other slot is a single selection and defaults to null.
const LIST_SLOTS = new Set(['nav', 'footer'])

// isActivePath — the framework-agnostic "you are here" nav match. It lives in
// vike-blocks (where the config-fed nav slots render through it); re-exported
// here so layout consumers reach it from one place and the two can't drift.
export { isActivePath } from 'vike-blocks'

/**
 * Resolve an app's layout config into a normalized descriptor a shell renders
 * from. Unknown/missing shells fall back to `centered` (the safe public default).
 *
 * `dir` is OPT-IN: set it only to FORCE a shell's direction. Left unset it is
 * `undefined`, so the shell renders no `dir` attribute and INHERITS the document
 * direction. That document direction is owned by the active locale (vike-i18n sets
 * `<html dir>` from the locale, #54), so an RTL locale flips every shell with no
 * per-layout wiring. Forcing `dir: 'rtl' | 'ltr'` here overrides that for one shell.
 *
 *   defineLayout({ shell: 'topbar', logo: 'Acme', nav: [{label,href}] })   // inherits
 *   defineLayout({ shell: 'topbar', dir: 'rtl' })                          // forced rtl
 */
export function defineLayout(config = {}) {
  const shell = config.shell && SHELLS[config.shell] ? config.shell : 'centered'
  const spec = SHELLS[shell]
  // Resolve ONE key per slot the shell declares — including any slot a custom shell
  // registered (nav/logo/footer/userMenu are just the built-in set). A slot the shell
  // doesn't declare is absent from `slots`, so it never reaches the shell: that is how a
  // centered (public) shell silently drops the nav/userMenu an app passed for app shells.
  const slots = {}
  for (const name of spec.slots) {
    slots[name] = config[name] ?? (LIST_SLOTS.has(name) ? [] : null)
  }
  return {
    shell,
    kind: spec.kind,
    dir: config.dir === 'rtl' || config.dir === 'ltr' ? config.dir : undefined,
    slots,
  }
}

/**
 * Pull the config value for each slot the SELECTED shell declares, flattening the
 * cumulative (array-of-arrays) ones into a single list. The per-framework ConfigLayout
 * feeds this into defineLayout so a page's raw config maps to the shell's slots — including
 * any slot a custom shell added, so custom slots flow end to end with no per-slot wiring.
 */
export function shellSlotConfig(config = {}) {
  const shell = config.layout && SHELLS[config.layout] ? config.layout : 'centered'
  const out = {}
  for (const name of SHELLS[shell].slots) {
    const value = config[name]
    out[name] = Array.isArray(value) ? value.flat() : value
  }
  return out
}
