// The React renderer for the `doc-nav` block — a documentation sidebar tree. Theme-native: every
// color / radius reads a vike-themes CSS variable. Categories are collapsible; which are open is
// local UI state, SEEDED from each group's `active` flag so the category holding the current page
// starts open and the rest start collapsed — the same on the server and the first client render, so
// there is no hydration mismatch. The active page's on-page sections splice in beneath it.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import {
  docNavRootStyle,
  docNavGroupStyle,
  docNavHeaderStyle,
  docNavHeaderTextStyle,
  docNavLinkStyle,
  docNavSectionStyle,
  docNavChevronStyle,
  DOC_NAV_STYLE_TAG,
} from '../blocks/doc-nav-styles.js'

function Chevron({ open }) {
  return (
    <svg className="vike-blocks-docnav-chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={docNavChevronStyle(open)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// A page link plus (when it is the current page) its on-page sections spliced beneath it.
function PageLink({ link }) {
  return (
    <>
      <a href={link.href ?? undefined} className="vike-blocks-docnav-link" aria-current={link.active ? 'page' : undefined} style={docNavLinkStyle(link.active)}>
        {link.label}
      </a>
      {link.active &&
        (link.sections ?? []).map((s, i) => (
          <a key={i} href={s.href ?? undefined} className="vike-blocks-docnav-section" style={docNavSectionStyle()}>
            {s.label}
          </a>
        ))}
    </>
  )
}

// One category: a header (collapsible -> a toggle button with a chevron; static -> a plain label)
// over its page links, shown while open.
function Group({ group, collapsible }) {
  const [open, setOpen] = useState(() => (collapsible ? !!group.active : true))
  const header = collapsible ? (
    <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} style={docNavHeaderStyle(true)}>
      <span style={docNavHeaderTextStyle(group.color)}>{group.label}</span>
      <Chevron open={open} />
    </button>
  ) : (
    <div style={docNavHeaderStyle(false)}>
      <span style={docNavHeaderTextStyle(group.color)}>{group.label}</span>
    </div>
  )
  return (
    <div data-slot="doc-nav-group" data-active={group.active || undefined} style={docNavGroupStyle()}>
      {header}
      {open && (
        <div style={{ marginTop: '0.35rem' }}>
          {(group.links ?? []).map((link, i) => (
            <PageLink key={link.href ?? i} link={link} />
          ))}
        </div>
      )}
    </div>
  )
}

export function DocNavView({ items = [], collapsible = true, current = null }) {
  return (
    <nav data-slot="doc-nav" aria-label="Documentation" data-current={current ?? undefined} style={docNavRootStyle()}>
      <style>{DOC_NAV_STYLE_TAG}</style>
      {items.map((it, i) =>
        it.type === 'group' ? <Group key={i} group={it} collapsible={collapsible} /> : <PageLink key={it.href ?? i} link={it} />,
      )}
    </nav>
  )
}

registerBlockRenderer('doc-nav', DocNavView)
