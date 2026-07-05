// The `command` block — a ⌘K command palette, harvested from shadcn's command (cmdk) and reimplemented
// dep-free on the shared Overlay primitive. A trigger button (a search-field affordance) and a global
// ⌘K / Ctrl+K hotkey open a modal with a filter input over grouped items; arrow-keys + Enter run one.
// Items are declared with an optional `to` (navigate on select) + `shortcut` hint; grouping is by
// `.group(label)`. Selecting an item navigates (the mutation axis #385 covers non-nav actions).
//
//   command()
//     .placeholder('Search commands...')
//     .group('Navigation')
//     .item('Dashboard', { to: '/', shortcut: '⌘H' })
//     .item('Users', { to: '/admin/users' })
//     .group('Actions')
//     .item('New post', { to: '/posts/new', shortcut: '⌘N' })
import { registerBlock } from '../core/registry.js'

// A fluent builder. `.group()` starts a labeled group; `.item()` appends to the current group (or an
// unlabeled first group). `to` navigates on select; `shortcut` is a display hint.
export function command() {
  const groups = []
  let current = null
  let placeholder = 'Type a command or search...'
  let empty = 'No results found.'
  let hotkey = 'k'
  let trigger
  const ensureGroup = () => {
    if (!current) {
      current = { items: [] }
      groups.push(current)
    }
    return current
  }
  const self = {
    group(label) {
      current = { label, items: [] }
      groups.push(current)
      return self
    },
    item(label, opts = {}) {
      ensureGroup().items.push({ label, ...(opts.to !== undefined ? { to: opts.to } : {}), ...(opts.shortcut !== undefined ? { shortcut: opts.shortcut } : {}) })
      return self
    },
    placeholder(t) {
      placeholder = t
      return self
    },
    empty(t) {
      empty = t
      return self
    },
    hotkey(k) {
      hotkey = k
      return self
    },
    trigger(label) {
      trigger = label
      return self
    },
    build() {
      return {
        block: 'command',
        placeholder,
        empty,
        hotkey,
        ...(trigger !== undefined ? { trigger } : {}),
        groups: groups.map((g) => ({ ...(g.label !== undefined ? { label: g.label } : {}), items: g.items.map((i) => ({ ...i })) })),
      }
    },
  }
  return self
}

// Resolve the palette chrome + the groups/items with defaults. The renderer owns the live open / query /
// active state; this is a pass-through of the declared commands.
registerBlock('command', {
  category: 'overlay',
  summary: "A command palette of searchable actions.",
  example: "command().group('Navigation').item('Dashboard', { to: '/' })",
  resolve({ props }) {
    return {
      placeholder: props.placeholder ?? 'Type a command or search...',
      empty: props.empty ?? 'No results found.',
      hotkey: props.hotkey ?? 'k',
      trigger: props.trigger ?? 'Search...',
      groups: (props.groups ?? []).map((g) => ({
        label: g.label ?? null,
        items: (g.items ?? []).map((i) => ({ label: i.label, to: i.to ?? null, shortcut: i.shortcut ?? null })),
      })),
    }
  },
})
