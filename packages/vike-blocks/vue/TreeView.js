// The Vue renderer for the `tree-view` block — the Vue twin of react/TreeView.jsx. A dep-free,
// theme-native nested hierarchy over the shared styles module. Each node is a role="treeitem" (a branch
// carries aria-expanded; a leaf with an href is a real <a>). Which branches are open is local state,
// SEEDED from each node's resolved `open` flag, so the server and the first client render agree = no
// hydration mismatch. Roving arrow-key focus is shared with the React twin via moveTreeFocus.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import {
  treeRootStyle,
  treeRowStyle,
  treeChevronStyle,
  treeSpacerStyle,
  treeLabelStyle,
  treeIconStyle,
  treeBadgeStyle,
  moveTreeFocus,
  TREE_STYLE_TAG,
} from '../blocks/tree-view-styles.js'

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
// role="group". `tabbable` marks the single initial tab stop; arrow keys hand it around via moveTreeFocus.
const TreeNode = {
  name: 'TreeNode',
  props: ['node', 'depth', 'tabbable'],
  setup(props) {
    const open = ref(!!props.node.open)
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
        if (e.key === 'ArrowRight' && branch && !open.value) {
          open.value = true
          e.preventDefault()
        } else if (e.key === 'ArrowLeft' && branch && open.value) {
          open.value = false
          e.preventDefault()
        } else if ((e.key === 'Enter' || e.key === ' ') && branch) {
          open.value = !open.value
          e.preventDefault()
        } else if (moveTreeFocus(e.currentTarget.closest('[role="tree"]'), e.currentTarget, e.key)) {
          e.preventDefault()
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
        tabindex: props.tabbable ? 0 : -1,
        'aria-expanded': branch ? String(open.value) : undefined,
        'aria-selected': node.active || undefined,
        'aria-disabled': node.disabled || undefined,
        'data-active': node.active ? 'true' : undefined,
        style: treeRowStyle(props.depth, node.active, node.disabled),
        onClick,
        onKeydown,
      }
      const row = isLink ? h('a', { href: node.href, ...rowProps }, inner) : h('div', rowProps, inner)
      const group =
        branch && open.value
          ? h(
              'div',
              { role: 'group' },
              (node.children ?? []).map((child, i) => h(TreeNode, { key: child.href ?? i, node: child, depth: props.depth + 1, tabbable: false })),
            )
          : null
      return h('div', { 'data-slot': 'tree-node' }, [row, group])
    }
  },
}

export const TreeView = {
  props: ['items'],
  setup(props) {
    return () =>
      h('div', { role: 'tree', 'data-slot': 'tree-view', style: treeRootStyle() }, [
        h('style', TREE_STYLE_TAG),
        ...(props.items ?? []).map((node, i) => h(TreeNode, { key: node.href ?? i, node, depth: 0, tabbable: i === 0 })),
      ])
  },
}

registerBlockRenderer('tree-view', TreeView)
