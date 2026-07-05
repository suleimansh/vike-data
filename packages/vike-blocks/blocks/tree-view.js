// The `tree-view` block — an arbitrary-depth nested hierarchy: branches expand/collapse, leaves link or
// select, one node is active. The file-explorer / folder-tree / org-chart / nested-settings surface. It
// generalizes `doc-nav` (which is fixed at category -> page -> section) to any depth. A from-scratch,
// dep-free block (ARIA `tree`/`treeitem`/`group` roles + roving arrow-key focus), theme-native. Leaves
// with an `href` are real <a>s, so a static tree navigates with no client JS; the open/closed state is
// local UI state in the renderer.
//
//   tree()
//     .current('/src/index.js')                       // active + auto-open the branch holding it
//     .node('src', { open: true }, [
//       { label: 'index.js', href: '/src/index.js' },
//       { label: 'utils', children: [{ label: 'dates.js', href: '/src/utils/dates.js' }] },
//     ])
//     .node('README.md', { href: '/readme' })
//
// A node is `{ label, href?, children?, open?, selected?, disabled?, icon?, badge? }` or a
// `[label, childrenArray]` / `[label, opts]` tuple; children recurse. Nodes can also be fed as the
// initial array (`tree([...])`) for a fully data-driven tree.
import { registerBlock } from '../core/registry.js'
import { resolveTree } from './tree-view-styles.js'

// Normalize one node (object, `[label, children]`, or `[label, opts]`) into a plain, cloned descriptor.
// Only known keys survive, and children recurse, so the built descriptor never aliases caller arrays.
function normNode(n) {
  if (Array.isArray(n)) {
    const [label, second] = n
    n = Array.isArray(second) ? { label, children: second } : { label, ...(second || {}) }
  }
  const out = { label: n.label }
  if (n.href != null) out.href = n.href
  if (n.icon != null) out.icon = n.icon
  if (n.badge != null) out.badge = n.badge
  if (n.selected) out.selected = true
  if (n.disabled) out.disabled = true
  if (n.open !== undefined) out.open = !!n.open
  if (n.children) out.children = n.children.map(normNode)
  return out
}

// A fluent builder, the recursive sibling of `doc-nav`. `.node(label, opts, children)` appends a node;
// `.current(path)` sets the reference for active/relevant highlighting (matched on a leaf's href, like
// doc-nav); `.collapsible(false)` pins every branch open.
export function tree(nodes = []) {
  const items = (nodes ?? []).map(normNode)
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
    node(label, opts = {}, children) {
      items.push(normNode({ label, ...opts, ...(children ? { children } : {}) }))
      return self
    },
    build() {
      return { block: 'tree-view', ...(current !== undefined ? { current } : {}), collapsible, items: items.map(normNode) }
    },
  }
  return self
}

// Resolve the hierarchy into view-models: each branch learns whether it holds the active node (so the
// renderer auto-opens that branch), each leaf whether it is the current page. Pure structure otherwise.
registerBlock('tree-view', {
  resolve({ props }) {
    return {
      collapsible: props.collapsible !== false,
      current: props.current ?? null,
      items: resolveTree(props.items ?? [], props.current ?? null),
    }
  },
})
