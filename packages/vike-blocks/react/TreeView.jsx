// The React renderer for the `tree-view` block — a dep-free, theme-native nested hierarchy. Each node
// is a role="treeitem" (a branch carries aria-expanded; a leaf with an href is a real <a>). Which
// branches are open is local UI state, SEEDED from each node's resolved `open` flag (an explicit flag,
// else "holds the active node"), so the server and the first client render agree = no hydration
// mismatch. Roving arrow-key focus (Up/Down/Home/End move; Right/Left expand/collapse) is shared with
// the Vue twin via moveTreeFocus. The row / chevron / label styles live in the shared styles module.
import { useState } from 'react'
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

function Chevron({ open }) {
  return (
    <svg className="vike-blocks-tree-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={treeChevronStyle(open)}>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  )
}

// One node: a treeitem row (chevron/spacer + icon + label + badge) plus, for an open branch, its
// children in a role="group". `tabbable` marks the single initial tab stop (only the first node);
// after that, arrow keys hand the tab stop around via moveTreeFocus.
function TreeNode({ node, depth, tabbable }) {
  const [open, setOpen] = useState(!!node.open)
  const branch = node.hasChildren
  const isLink = node.href != null && !node.disabled && !branch

  const onClick = (e) => {
    if (node.disabled) {
      e.preventDefault()
      return
    }
    if (branch) setOpen((o) => !o) // a branch toggles; a leaf link navigates natively
  }

  const onKeyDown = (e) => {
    if (node.disabled) return
    if (e.key === 'ArrowRight' && branch && !open) {
      setOpen(true)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && branch && open) {
      setOpen(false)
      e.preventDefault()
    } else if ((e.key === 'Enter' || e.key === ' ') && branch) {
      setOpen((o) => !o)
      e.preventDefault()
    } else if (moveTreeFocus(e.currentTarget.closest('[role="tree"]'), e.currentTarget, e.key)) {
      e.preventDefault()
    }
  }

  const rowProps = {
    className: 'vike-blocks-tree-row',
    role: 'treeitem',
    tabIndex: tabbable ? 0 : -1,
    'aria-expanded': branch ? open : undefined,
    'aria-selected': node.active || undefined,
    'aria-disabled': node.disabled || undefined,
    'data-active': node.active ? 'true' : undefined,
    style: treeRowStyle(depth, node.active, node.disabled),
    onClick,
    onKeyDown,
  }

  const inner = (
    <>
      {branch ? <Chevron open={open} /> : <span aria-hidden="true" style={treeSpacerStyle()} />}
      {node.icon != null && <span aria-hidden="true" style={treeIconStyle()}>{node.icon}</span>}
      <span style={treeLabelStyle()}>{node.label}</span>
      {node.badge != null && <span style={treeBadgeStyle()}>{node.badge}</span>}
    </>
  )

  return (
    <div data-slot="tree-node">
      {isLink ? (
        <a href={node.href} {...rowProps}>{inner}</a>
      ) : (
        <div {...rowProps}>{inner}</div>
      )}
      {branch && open && (
        <div role="group">
          {(node.children ?? []).map((child, i) => (
            <TreeNode key={child.href ?? i} node={child} depth={depth + 1} tabbable={false} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ items = [] }) {
  return (
    <div role="tree" data-slot="tree-view" style={treeRootStyle()}>
      <style>{TREE_STYLE_TAG}</style>
      {items.map((node, i) => (
        <TreeNode key={node.href ?? i} node={node} depth={0} tabbable={i === 0} />
      ))}
    </div>
  )
}

registerBlockRenderer('tree-view', TreeView)
