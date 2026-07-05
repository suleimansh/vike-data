// The React renderer for the `tree-view` block — a dep-free, theme-native nested hierarchy. Each node
// is a role="treeitem" (a branch carries aria-expanded; a leaf with an href is a real <a>). Which
// branches are open is local UI state, SEEDED from each node's resolved `open` flag (an explicit flag,
// else "holds the active node"), so the server and the first client render agree = no hydration
// mismatch. Arrow keys rove focus (Up/Down/Home/End move; Right opens then enters, Left collapses then
// exits) with the DOM helpers shared with the Vue twin. The single tab stop is root state (activePath)
// that each row reads from context and syncs on focus, so collapsing a branch can't strand it. The row /
// chevron / label styles live in the shared styles module.
import { useState, createContext, useContext } from 'react'
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

// Carries the single roving tab stop (a node path) + its setter down the tree.
const TreeCtx = createContext({ activePath: '0', setActivePath: () => {} })

function Chevron({ open }) {
  return (
    <svg className="vike-blocks-tree-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={treeChevronStyle(open)}>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  )
}

// One node: a treeitem row (chevron/spacer + icon + label + badge) plus, for an open branch, its
// children in a role="group". `path` is the node's position id ("0", "0.1", ...); the row is the tab
// stop when it equals the context's activePath. Focusing a row (arrow keys, or a click) claims the tab
// stop via onFocus, so it always tracks a mounted, visible row.
function TreeNode({ node, depth, path }) {
  const { activePath, setActivePath } = useContext(TreeCtx)
  const [open, setOpen] = useState(!!node.open)
  const branch = node.hasChildren
  const isLink = node.href != null && !node.disabled && !branch
  const focusItem = (el) => el && el.focus() // onFocus then claims the tab stop

  const onClick = (e) => {
    if (node.disabled) {
      e.preventDefault()
      return
    }
    if (branch) setOpen((o) => !o) // a branch toggles; a leaf link navigates natively
  }

  const onKeyDown = (e) => {
    if (node.disabled) return
    const key = e.key
    if (key === 'ArrowRight') {
      if (branch && !open) setOpen(true) // closed branch: open it
      else if (branch && open) focusItem(firstChildItem(e.currentTarget)) // open branch: enter it
      else return
      e.preventDefault()
    } else if (key === 'ArrowLeft') {
      if (branch && open) {
        setOpen(false) // open branch: collapse it
        e.preventDefault()
      } else {
        const p = parentItem(e.currentTarget) // leaf / closed branch: out to the parent
        if (p) {
          focusItem(p)
          e.preventDefault()
        }
      }
    } else if ((key === 'Enter' || key === ' ') && branch) {
      setOpen((o) => !o)
      e.preventDefault()
    } else {
      const target = rovingTarget(e.currentTarget.closest('[role="tree"]'), e.currentTarget, key)
      if (target) {
        focusItem(target)
        e.preventDefault()
      }
    }
  }

  const rowProps = {
    className: 'vike-blocks-tree-row',
    role: 'treeitem',
    tabIndex: activePath === path ? 0 : -1,
    'aria-expanded': branch ? open : undefined,
    'aria-selected': node.active || undefined,
    'aria-disabled': node.disabled || undefined,
    'data-active': node.active ? 'true' : undefined,
    style: treeRowStyle(depth, node.active, node.disabled),
    onClick,
    onKeyDown,
    onFocus: () => setActivePath(path),
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
            <TreeNode key={child.href ?? i} node={child} depth={depth + 1} path={`${path}.${i}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ items = [] }) {
  // The tab stop starts on the first node (path "0"), matching the server render, then follows focus.
  const [activePath, setActivePath] = useState('0')
  return (
    <TreeCtx.Provider value={{ activePath, setActivePath }}>
      <div role="tree" data-slot="tree-view" style={treeRootStyle()}>
        <style>{TREE_STYLE_TAG}</style>
        {items.map((node, i) => (
          <TreeNode key={node.href ?? i} node={node} depth={0} path={String(i)} />
        ))}
      </div>
    </TreeCtx.Provider>
  )
}

registerBlockRenderer('tree-view', TreeView)
