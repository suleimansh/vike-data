// The `doc-nav` block — a documentation sidebar tree: collapsible categories, page links, active +
// relevant state, and an on-page section splice under the active page. This is the one real block
// gap the #420 spike found (DocPress's shell expressed on the vike-blocks IR): navbar / article /
// mobile-menu all compose from existing blocks, but the sidebar tree needed its own block.
//
// A fluent accumulating builder, the vertical sibling of `nav-menu`: `.group(label, links)` appends a
// category of page links; `.link(label, href, sections)` appends an ungrouped page; `.current(path)`
// gives the active/relevant highlighting its reference; `.collapsible(false)` pins every category open.
// A link is `{ label, href, sections? }` or a `[label, href, sections]` tuple; a section is
// `{ label, href }` or `[label, href]`. Navigation is a real <a>, so it works with no client JS.
//
//   docNav()
//     .current('/guide/setup')
//     .group('Guide', [
//       { label: 'Intro', href: '/guide/intro' },
//       { label: 'Setup', href: '/guide/setup', sections: [['Install', '#install'], ['Config', '#config']] },
//     ])
//     .group('API', [['CLI', '/api/cli']])
//
// A doc framework can skip the per-item calls and feed its own flat, leveled nav list through
// `.tree(groupLeveledItems(navItemsAll))` (see doc-nav-styles.js) — the DocPress adapter's path.
import { registerBlock } from '../core/registry.js'
import { resolveDocNav } from './doc-nav-styles.js'

// Normalize one section (object or [label, href] tuple) to { label, href }.
function normSections(list) {
  return (list ?? []).map((s) =>
    Array.isArray(s) ? { label: s[0], ...(s[1] != null ? { href: s[1] } : {}) } : { label: s.label, ...(s.href != null ? { href: s.href } : {}) },
  )
}

// Normalize one page link (object or [label, href, sections] tuple) to { label, href?, sections? }.
function normLink(l) {
  if (Array.isArray(l)) return { label: l[0], ...(l[1] != null ? { href: l[1] } : {}), ...(l[2] ? { sections: normSections(l[2]) } : {}) }
  return { label: l.label, ...(l.href != null ? { href: l.href } : {}), ...(l.sections ? { sections: normSections(l.sections) } : {}) }
}

// Deep-clone an item so the built descriptor never aliases the builder's internal arrays.
function cloneItem(it) {
  if (it.type === 'group') return { ...it, links: (it.links ?? []).map((l) => ({ ...l, ...(l.sections ? { sections: l.sections.map((s) => ({ ...s })) } : {}) })) }
  return { ...it, ...(it.sections ? { sections: it.sections.map((s) => ({ ...s })) } : {}) }
}

export function docNav() {
  const items = []
  let current
  let collapsible = true
  const self = {
    current(path) {
      current = path
      return self
    },
    collapsible(value) {
      collapsible = value !== false
      return self
    },
    link(label, href, sections) {
      items.push({ type: 'link', label, ...(href !== undefined ? { href } : {}), ...(sections ? { sections: normSections(sections) } : {}) })
      return self
    },
    group(label, links = [], opts = {}) {
      items.push({ type: 'group', label, ...(opts.color ? { color: opts.color } : {}), links: (links ?? []).map(normLink) })
      return self
    },
    // Append a prebuilt, already-normalized item list (e.g. from groupLeveledItems) — the adapter path.
    tree(list = []) {
      for (const it of list ?? []) items.push(cloneItem(it))
      return self
    },
    build() {
      return { block: 'doc-nav', ...(current !== undefined ? { current } : {}), collapsible, items: items.map(cloneItem) }
    },
  }
  return self
}

// Resolve the tree: compute active (the current page) + relevant (the category holding it) so the
// renderer can open the right category, highlight the current page, and splice its sections. A
// pass-through of declared structure otherwise.
registerBlock('doc-nav', {
  category: 'navigation',
  summary: "A documentation sidebar navigation tree.",
  example: "docNav().current('/guide/setup').group('Guide', [{ label: 'Setup', href: '/guide/setup' }])",
  resolve({ props }) {
    return {
      collapsible: props.collapsible !== false,
      current: props.current ?? null,
      items: resolveDocNav(props.items ?? [], props.current ?? null),
    }
  },
})
