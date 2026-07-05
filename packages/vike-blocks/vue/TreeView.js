// The Vue renderer for the `tree-view` block — the Vue twin of react/TreeView.jsx. A dep-free,
// theme-native nested hierarchy over the shared styles module. Each node is a role="treeitem" (a branch
// carries aria-expanded; a leaf with an href is a real <a>). Which branches are open is local state,
// SEEDED from each node's resolved `open` flag, so the server and the first client render agree = no
// hydration mismatch. Roving arrow-key focus + the single tab stop (activePath) mirror the React twin.
import { h, ref, provide, inject } from 'vue'
import { registerBlockRenderer } from './registry.js'
import {
  treeRootStyle,
  treeRowStyle,
  treeChevronStyle,
  treeSpacerStyle,
  treeLabelStyle,
  treeIconStyle,
  treeBadgeStyle,
  rovingTarget,
  firstChildItem,
  parentItem,
  TREE_STYLE_TAG,
} from '../blocks/tree-view-styles.js'

// Injection key for the single roving tab stop (a node path ref) shared down the tree.
const TREE_ACTIVE = Symbol('treeActivePath')

const chevron = (open) =>
  h(
    'svg',
    {
      class: 'vike-blocks-tree-chevron',
      'aria-hidden': 'true',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      style: treeChevronStyle(open),
    },
    [h('polyline', { points: '9 6 15 12 9 18' })],
  )

// A self-referencing recursive component: a treeitem row plus, for an open branch, its children in a
// role="group". `path` is the node's position id; the row is the tab stop when it equals the injected
// activePath, and focusing it (arrow keys or a click) claims the tab stop via onFocus.
const TreeNode = {
  name: 'TreeNode',
  props: ['node', 'depth', 'path'],
  setup(props) {
    const open = ref(!!props.node.open)
    const active = inject(TREE_ACTIVE)
    const focusItem = (el) => el && el.focus() // onFocus then claims the tab stop
    return () => {
      const node = props.node
      const branch = node.hasChildren
      const isLink = node.href != null && !node.disabled && !branch

      const onClick = (e) => {
        if (node.disabled) {
          e.preventDefault()
          return
        }
        if (branch) open.value = !open.value
      }
      const onKeydown = (e) => {
        if (node.disabled) return
        const key = e.key
        if (key === 'ArrowRight') {
          if (branch && !open.value) open.value = true // closed branch: open it
          else if (branch && open.value) focusItem(firstChildItem(e.currentTarget)) // open branch: enter it
          else return
          e.preventDefault()
        } else if (key === 'ArrowLeft') {
          if (branch && open.value) {
            open.value = false // open branch: collapse it
            e.preventDefault()
          } else {
            const p = parentItem(e.currentTarget) // leaf / closed branch: out to the parent
            if (p) {
              focusItem(p)
              e.preventDefault()
            }
          }
        } else if ((key === 'Enter' || key === ' ') && branch) {
          open.value = !open.value
          e.preventDefault()
        } else {
          const target = rovingTarget(e.currentTarget.closest('[role="tree"]'), e.currentTarget, key)
          if (target) {
            focusItem(target)
            e.preventDefault()
          }
        }
      }

      const inner = [
        branch ? chevron(open.value) : h('span', { 'aria-hidden': 'true', style: treeSpacerStyle() }),
        node.icon != null ? h('span', { 'aria-hidden': 'true', style: treeIconStyle() }, node.icon) : null,
        h('span', { style: treeLabelStyle() }, node.label),
        node.badge != null ? h('span', { style: treeBadgeStyle() }, node.badge) : null,
      ]
      const rowProps = {
        class: 'vike-blocks-tree-row',
        role: 'treeitem',
        tabindex: active.value === props.path ? 0 : -1,
        'aria-expanded': branch ? String(open.value) : undefined,
        'aria-selected': node.active || undefined,
        'aria-disabled': node.disabled || undefined,
        'data-active': node.active ? 'true' : undefined,
        style: treeRowStyle(props.depth, node.active, node.disabled),
        onClick,
        onKeydown,
        onFocus: () => (active.value = props.path),
      }
      const row = isLink ? h('a', { href: node.href, ...rowProps }, inner) : h('div', rowProps, inner)
      const group =
        branch && open.value
          ? h(
              'div',
              { role: 'group' },
              (node.children ?? []).map((child, i) => h(TreeNode, { key: child.href ?? i, node: child, depth: props.depth + 1, path: `${props.path}.${i}` })),
            )
          : null
      return h('div', { 'data-slot': 'tree-node' }, [row, group])
    }
  },
}

export const TreeView = {
  props: ['items'],
  setup(props) {
    // The tab stop starts on the first node (path "0"), matching the server render, then follows focus.
    const active = ref('0')
    provide(TREE_ACTIVE, active)
    return () =>
      h('div', { role: 'tree', 'data-slot': 'tree-view', style: treeRootStyle() }, [
        h('style', TREE_STYLE_TAG),
        ...(props.items ?? []).map((node, i) => h(TreeNode, { key: node.href ?? i, node, depth: 0, path: String(i) })),
      ])
  },
}

registerBlockRenderer('tree-view', TreeView)
