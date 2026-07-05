// Shared, framework-agnostic logic + styling for the `doc-nav` block (a documentation sidebar tree),
// imported by BOTH the react and vue renderers so the twins can't drift. This owns the pure model
// work — active/relevant computation (resolveDocNav), the leveled -> grouped adapter
// (groupLeveledItems) a doc framework like DocPress feeds in, and the theme-native styles.

// The "same page" matcher lives in _shared (tree-view uses it too); re-export it as part of this
// module's surface. Exact by design: a page link lights up only on its own page, not a descendant.
export { samePath } from './_shared.js'
import { samePath } from './_shared.js'

// Resolve one page link against the current path: mark it active on its own page, and pass its
// on-page sections (level-3 hash links) through. The renderer reveals a link's sections only when the
// link is active — the "section splice under the active page" behavior.
function resolveLink(l, current) {
  const active = l.href != null && samePath(current, l.href)
  const sections = (l.sections ?? []).map((s) => ({ label: s.label, href: s.href ?? null }))
  return { label: l.label, href: l.href ?? null, active, ...(sections.length ? { sections } : {}) }
}

// Resolve a doc-nav item list into view-models: each group learns whether it holds the active page
// (its `active` flag, which the renderer uses to open the relevant category and collapse the rest),
// and each page link learns whether it is the current page. A pure pass — no framework, no state.
export function resolveDocNav(items, current) {
  return (items ?? []).map((it) => {
    if (it.type === 'group') {
      const links = (it.links ?? []).map((l) => resolveLink(l, current))
      return {
        type: 'group',
        label: it.label ?? null,
        ...(it.color ? { color: it.color } : {}),
        active: links.some((l) => l.active), // "relevant": the branch containing the current page
        links,
      }
    }
    return { type: 'link', ...resolveLink(it, current) }
  })
}

// Adapt a FLAT, leveled nav list (the shape a doc framework emits: level 1 = category, 2 = page,
// 3 = on-page section, 4 = column hint) into doc-nav's grouped `items`. Level-1 opens a category;
// level-2 pages fall under the open category (or top-level when there is none); level-3 sections
// attach to the page above them; level-4 column hints are dropped. This is the seam that lets
// DocPress's `resolved.navItemsAll` drive a docNav block with no per-item rewrite at the call site.
export function groupLeveledItems(leveled) {
  const items = []
  let group = null
  let lastLink = null
  for (const n of leveled ?? []) {
    const label = n.titleInNav ?? n.title ?? ''
    if (n.level === 1) {
      group = { type: 'group', label, ...(n.color ? { color: n.color } : {}), links: [] }
      items.push(group)
      lastLink = null
    } else if (n.level === 2) {
      if (group) {
        lastLink = { label, ...(n.url != null ? { href: n.url } : {}) }
        group.links.push(lastLink)
      } else {
        lastLink = { type: 'link', label, ...(n.url != null ? { href: n.url } : {}) }
        items.push(lastLink)
      }
    } else if (n.level === 3 && lastLink) {
      ;(lastLink.sections ??= []).push({ label, ...(n.url != null ? { href: n.url } : {}) })
    }
  }
  return items
}

// ---- styles (theme-native) ------------------------------------------------------------------

export const docNavRootStyle = () => ({
  font: 'inherit',
  fontSize: '14px',
  lineHeight: 1.5,
  color: 'var(--color-text, #0f172a)',
})

export const docNavGroupStyle = () => ({ marginBottom: '1.1rem' })

// The category header row: a collapsible one shows a chevron + is a full-width button; a static one
// is a plain label. The category color (when a group carries one) accents the label, mirroring how a
// doc framework colors its sections.
export function docNavHeaderStyle(collapsible) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    width: '100%',
    padding: '0.25rem 0',
    border: 0,
    background: 'transparent',
    cursor: collapsible ? 'pointer' : 'default',
    textAlign: 'left',
    font: 'inherit',
  }
}

export function docNavHeaderTextStyle(color) {
  return {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: color || 'var(--color-muted, #64748b)',
  }
}

// One page link. Active = the current page: full-strength text, a primary left accent. Inactive =
// muted. The accent bar keeps the row aligned whether active or not (transparent border otherwise).
export function docNavLinkStyle(active) {
  return {
    display: 'block',
    padding: '0.3rem 0.6rem',
    marginLeft: '-2px',
    borderLeft: `2px solid ${active ? 'var(--color-primary, #6366f1)' : 'transparent'}`,
    borderRadius: '0 calc(var(--radius, 10px) - 6px) calc(var(--radius, 10px) - 6px) 0',
    color: active ? 'var(--color-text, #0f172a)' : 'var(--color-muted, #64748b)',
    fontWeight: active ? 600 : 400,
    textDecoration: 'none',
  }
}

// An on-page section link (level 3), shown indented under the active page.
export function docNavSectionStyle() {
  return {
    display: 'block',
    padding: '0.2rem 0.6rem 0.2rem 1.4rem',
    color: 'var(--color-muted, #64748b)',
    fontSize: '13px',
    textDecoration: 'none',
  }
}

// A rotating chevron for a collapsible category, drawn in currentColor so it follows the label.
export function docNavChevronStyle(open) {
  return {
    flexShrink: 0,
    width: '12px',
    height: '12px',
    color: 'var(--color-muted, #94a3b8)',
    transition: 'transform 0.2s ease',
    transform: open ? 'none' : 'rotate(-90deg)',
  }
}

// Static <style> for the hover/focus states + reduced-motion, on the shared classes so both twins
// share one rule. Links tint their background on hover; the chevron stills under reduced-motion.
export const DOC_NAV_STYLE_TAG =
  '.vike-blocks-docnav-link:hover{background:var(--color-surface,#f1f5f9)}' +
  '.vike-blocks-docnav-link:focus-visible{outline:2px solid var(--color-primary,#6366f1);outline-offset:-2px}' +
  '.vike-blocks-docnav-section:hover{color:var(--color-text,#0f172a)}' +
  '@media (prefers-reduced-motion: reduce){.vike-blocks-docnav-chevron{transition:none}}'
