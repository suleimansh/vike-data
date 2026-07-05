// The `layout` block — a CONTAINER block whose named SLOTS are page regions, each a nested
// composition of blocks. This is the #401 unification: a layout is not a separate system, it is
// the same block IR as tabs/card/accordion — a container that resolves its nested sections
// recursively. A `variant` selects a swappable shell implementation (landing / centered / docs),
// drawn by the per-framework renderer registered for `layout` (exactly the tabs model). So
// "declare intent, derive implementation" now extends to page STRUCTURE: an author (or an AI)
// declares "a landing layout with these regions" and the descriptor stays serializable — it can't
// break the shell.
//
//   layout('landing')
//     .slot('header', [ slot('nav').from('config'), button('Sign in') ])
//     .slot('main',   [ heading('Ship faster'), text('...') ])
//     .slot('footer', [ text('(c) Acme') ])
//   // -> { block:'layout', variant:'landing', slots:{ header:[...], main:[...], footer:[...] } }
//
// A region's blocks are ordinary blocks, so a layout composes recursively (a region can hold a
// card, a tabs, even another layout). Slot content comes from one of two sources, which is how app
// CHROME and page CONTENT share ONE model without collapsing into each other:
//   - inline blocks          -> the region draws the nested blocks you passed (page content).
//   - a `slot` placeholder   -> `slot('nav').from('config')` draws a cumulative config
//                               contribution at render time (the vike-layouts chrome seam), so an
//                               extension still adds a nav/toolbar item without editing pages.
import { registerBlock } from '../core/registry.js'
import { containerResolve, collapseSections as collapse } from '../core/page.js'

// Collapse a section that is a builder to its plain descriptor (definePage does this for top-level
// sections; a region's nested sections need the same so `resolve` gets `{ block, ...props }`).

// A fluent builder for a layout block. `layout('landing')` sets the initial variant; `.slot()`
// adds a named region (its sections collapse now so a nested builder collapses recursively);
// `.slots({...})` adds several at once. Order of `.slot()` calls is preserved (the shell decides
// placement, but the descriptor keeps insertion order for a stable, predictable serialization).
export function layout(initialVariant) {
  let variant = initialVariant
  const slots = {}
  const self = {
    variant(value) {
      variant = value
      return self
    },
    slot(name, sections = []) {
      if (!name || typeof name !== 'string') throw new Error('layout.slot: a non-empty slot name is required')
      slots[name] = collapse(sections)
      return self
    },
    slots(map = {}) {
      if (map == null || typeof map !== 'object') throw new Error('layout.slots: expected an object of { name: sections }')
      for (const [name, sections] of Object.entries(map)) self.slot(name, sections)
      return self
    },
    build() {
      const out = {}
      for (const [name, sections] of Object.entries(slots)) out[name] = sections.map((s) => ({ ...s }))
      return { block: 'layout', ...(variant !== undefined ? { variant } : {}), slots: out }
    },
  }
  return self
}

// Resolve each region's sections into serializable view-models (the recursive step that makes a
// layout a container, same as tabs' panels). `variant` defaults to 'stack' — the neutral shell
// that stacks its regions — so a variant-less layout still renders.
registerBlock('layout', {
  category: 'layout',
  summary: "A page layout whose named slots hold blocks.",
  container: true,
  example: "layout('landing').slot('main', [heading('Hi').level(1)])",
  resolve({ props, tables }) {
    const slots = {}
    for (const [name, sections] of Object.entries(props.slots ?? {})) {
      slots[name] = containerResolve(sections, tables)
    }
    return { variant: props.variant ?? 'stack', slots }
  },
})

// The `slot` block — a first-class PLACEHOLDER (the #401 "slots as elements" answer). It renders
// its assigned children, and `from` names WHERE those children come from, keeping the IR
// serializable (a descriptor names a source; it never carries a component):
//   - from:'children' (default) -> the inline blocks passed to it, e.g. slot('main', [heading(...)]).
//   - from:'config'             -> a cumulative config contribution the renderer reads at render
//                                  time (nav/toolbar). `source` names the config key (defaults to
//                                  the slot's own `name`), so `slot('nav').from('config')` reads
//                                  the `nav` contribution — the vike-layouts seam, as a block.
//
//   slot('nav').from('config')                 // draws the app's contributed nav
//   slot('main', [ heading('Hi'), text('.') ]) // draws its own children (from:'children')
export function slot(name, sections = []) {
  if (!name || typeof name !== 'string') throw new Error('slot: a non-empty name is required')
  let from = 'children'
  let source
  let only
  const body = collapse(sections)
  const self = {
    from(value) {
      from = value
      return self
    },
    source(value) {
      source = value
      return self
    },
    only(value) {
      only = value // 'start' | 'end' — narrow a config nav to the leading/trailing items
      return self
    },
    build() {
      return {
        block: 'slot',
        name,
        from,
        ...(source !== undefined ? { source } : {}),
        ...(only !== undefined ? { only } : {}),
        ...(body.length ? { sections: body.map((s) => ({ ...s })) } : {}),
      }
    },
  }
  return self
}

// A placeholder resolves to its wiring (name / from / source) plus its resolved inline children.
// A pass-through by design: the renderer FILLS it (from its children, a config source, or the live
// page content), so the descriptor stays plain data. `source` falls back to the slot's `name` (a
// `nav` slot reads the `nav` contribution) so the common case needs no explicit source. `only`
// (for a config nav) narrows to the leading (`start`) or trailing (`end`) items — how a shell puts
// some nav items by the logo and others by the user menu.
registerBlock('slot', {
  category: 'layout',
  summary: "A named placeholder filled by config or child blocks.",
  container: true,
  example: "slot('nav').from('config')",
  resolve({ props, tables }) {
    const sections = props.sections ? containerResolve(props.sections, tables) : []
    return {
      name: props.name ?? null,
      from: props.from ?? 'children',
      source: props.source ?? props.name ?? null,
      ...(props.only !== undefined ? { only: props.only } : {}),
      sections,
    }
  },
})

// isActivePath — true when a nav item's `href` matches the current path. The framework-agnostic
// half of "you are here" highlighting, shared by the React and Vue slot renderers so they agree.
// The root `/` is exact-match only (else it lights up everywhere); every other href matches its own
// page AND descendants (`/admin` stays active on `/admin/users`). Trailing slashes are ignored on
// both sides; a query string or hash on the current path is dropped before comparing. (Mirrors the
// helper that lived in vike-layouts, moved here so a config-fed nav slot can highlight without a
// vike dependency — the current path is passed in as data.)
export function isActivePath(currentPath, href) {
  if (typeof currentPath !== 'string' || typeof href !== 'string' || href === '') return false
  const strip = (p) => {
    const noQuery = p.replace(/[?#].*$/, '')
    return noQuery.length > 1 ? noQuery.replace(/\/+$/, '') : noQuery
  }
  const cur = strip(currentPath)
  const target = strip(href)
  if (target === '/') return cur === '/'
  return cur === target || cur.startsWith(target + '/')
}
