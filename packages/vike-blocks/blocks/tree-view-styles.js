// Shared, framework-agnostic logic + styling for the `tree-view` block, imported by BOTH the react and
// vue renderers so the twins can't drift. Owns the pure model work (active/relevant computation +
// auto-open seeding), the DOM roving-focus helper the arrow keys use, and the theme-native styles.

// Compare two paths for "same page": drop any query/hash + trailing slash, so `/a/b`, `/a/b/`, and
// `/a/b#x` all match. A leaf lights up only on its own href, never a descendant (that's the branch's job).
export function samePath(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const strip = (p) => {
    const noHash = p.replace(/[?#].*$/, '')
    return noHash.length > 1 ? noHash.replace(/\/+$/, '') : noHash
  }
  return strip(a) === strip(b)
}

// Resolve one node against the current path (recursively). A node is active when its own href matches;
// it is "relevant" (holds the active node) when itself or any descendant is active. `open` seeds the
// renderer's initial disclosure: an explicit `open` flag wins, else a branch opens when it is relevant,
// so the branch containing the selected node is expanded on the first paint (server + client agree).
function resolveNode(n, current) {
  const children = (n.children ?? []).map((c) => resolveNode(c, current))
  const selfActive = n.href != null && samePath(current, n.href)
  const active = selfActive || !!n.selected
  const relevant = active || children.some((c) => c.relevant)
  const hasChildren = children.length > 0
  return {
    label: n.label,
    href: n.href ?? null,
    icon: n.icon ?? null,
    badge: n.badge ?? null,
    disabled: !!n.disabled,
    hasChildren,
    active,
    relevant,
    open: hasChildren && (n.open ?? relevant),
    ...(hasChildren ? { children } : {}),
  }
}

// Resolve a node list into view-models — a pure pass, no framework, no state.
export function resolveTree(items, current) {
  return (items ?? []).map((n) => resolveNode(n, current))
}

// ---- roving focus (DOM helper, reused by both renderers) ------------------------------------------

// The treeitems currently visible (a collapsed branch's descendants have no layout box). `offsetParent`
// is null for a display:none / detached node, so this skips rows inside closed branches.
function visibleItems(rootEl) {
  return Array.from(rootEl.querySelectorAll('[role="treeitem"]')).filter((el) => el.offsetParent !== null)
}

// Move roving focus among visible treeitems on Up/Down/Home/End: focus the target and hand it the single
// tab stop (tabIndex 0), demoting the previous one. Returns true when it handled the key. Left/Right
// (expand/collapse) stay in the renderer since they toggle its local open state.
export function moveTreeFocus(rootEl, currentEl, key) {
  if (!rootEl) return false
  const items = visibleItems(rootEl)
  const i = items.indexOf(currentEl)
  let next = -1
  if (key === 'ArrowDown') next = i < 0 ? 0 : Math.min(items.length - 1, i + 1)
  else if (key === 'ArrowUp') next = i < 0 ? 0 : Math.max(0, i - 1)
  else if (key === 'Home') next = 0
  else if (key === 'End') next = items.length - 1
  else return false
  const target = items[next]
  if (target && target !== currentEl) {
    if (currentEl) currentEl.tabIndex = -1
    target.tabIndex = 0
    target.focus()
  }
  return true
}

// ---- styles (theme-native) ------------------------------------------------------------------------

export const treeRootStyle = () => ({
  font: 'inherit',
  fontSize: '14px',
  lineHeight: 1.5,
  color: 'var(--color-text, #0f172a)',
})

// One node row. Depth drives the indent; active gets a primary tint + a left accent (the border keeps
// every row aligned whether active or not). A disabled row is muted and non-interactive.
export function treeRowStyle(depth, active, disabled) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.5rem',
    paddingLeft: `calc(0.5rem + ${depth} * 1.05rem)`,
    borderRadius: 'calc(var(--radius, 10px) - 4px)',
    borderLeft: `2px solid ${active ? 'var(--color-primary, #6366f1)' : 'transparent'}`,
    background: active ? 'var(--color-primary-soft, rgba(99,102,241,0.1))' : 'transparent',
    color: disabled ? 'var(--color-muted, #94a3b8)' : active ? 'var(--color-text, #0f172a)' : 'var(--color-text, #334155)',
    fontWeight: active ? 600 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    outline: 'none',
    userSelect: 'none',
  }
}

// A rotating disclosure chevron for a branch, drawn in currentColor. A leaf gets a same-width spacer
// (treeSpacerStyle) so leaf and branch labels line up.
export function treeChevronStyle(open) {
  return {
    flexShrink: 0,
    width: '14px',
    height: '14px',
    color: 'var(--color-muted, #94a3b8)',
    transition: 'transform 0.18s ease',
    transform: open ? 'none' : 'rotate(-90deg)',
  }
}

export const treeSpacerStyle = () => ({ flexShrink: 0, width: '14px', height: '14px' })

export const treeLabelStyle = () => ({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

export const treeIconStyle = () => ({ flexShrink: 0, width: '1.05em', textAlign: 'center', opacity: 0.85 })

// A trailing count pill (e.g. an item count on a folder).
export const treeBadgeStyle = () => ({
  flexShrink: 0,
  padding: '0 0.4rem',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 600,
  background: 'var(--color-surface, #f1f5f9)',
  color: 'var(--color-muted, #64748b)',
})

// Static <style> for hover + focus states + reduced-motion, on the shared classes so both twins share
// one rule. A row tints on hover; the focused treeitem shows the theme ring; the chevron stills under
// reduced-motion.
export const TREE_STYLE_TAG =
  '.vike-blocks-tree-row:hover{background:var(--color-surface,#f1f5f9)}' +
  '.vike-blocks-tree-row[data-active=true]:hover{background:var(--color-primary-soft,rgba(99,102,241,0.14))}' +
  '.vike-blocks-tree-row:focus-visible{outline:2px solid var(--color-primary,#6366f1);outline-offset:-2px}' +
  '@media (prefers-reduced-motion: reduce){.vike-blocks-tree-chevron{transition:none}}'
