// The React renderer for the `nav-menu` block — a dep-free, theme-native navigation bar. Top-level
// links are plain <a>; a group's trigger opens a dropdown of links anchored below it, reusing the
// popover primitive (anchor + outside-click + Escape + open-gated SSR) and the dropdown's roving
// arrow-key nav. One section is open at a time (openIndex local state), so opening one closes the
// others. SSR renders the bar (links + triggers) but no open panel, so there's no hydration mismatch.
// The bar / trigger / group-link styles live in the shared nav-menu-styles + popover-styles modules.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.jsx'
import { popoverSurfaceStyle, popoverMotionStyle } from '../blocks/popover-styles.js'
import { moveMenuFocus } from '../blocks/dropdown-styles.js'
import { navRootStyle, navLinkStyle, navTriggerStyle, navGroupLinkStyle, navGroupLinkTitleStyle, navGroupLinkDescStyle, navGroupPanelStyle, NAV_STYLE_TAG } from '../blocks/nav-menu-styles.js'

function GroupMenu({ label, links, open, onToggle, onClose }) {
  const trigger = (
    <button type="button" className="vike-blocks-navitem" aria-haspopup="menu" aria-expanded={open} style={navTriggerStyle(open)} onClick={onToggle}>
      <span>{label}</span>
      <span aria-hidden="true" style={{ fontSize: 11 }}>{'▾'}</span>
    </button>
  )
  return (
    <Popover open={open} onClose={onClose} trigger={trigger} placement="bottom-start" role="menu" panelStyle={(v, pl) => ({ ...popoverSurfaceStyle(), ...navGroupPanelStyle(), ...popoverMotionStyle(v, pl) })}>
      <div onKeyDown={(e) => moveMenuFocus(e.currentTarget, e.key) && e.preventDefault()} data-slot="nav-group">
        {links.map((l, i) =>
          l.to != null ? (
            <a key={i} href={l.to} role="menuitem" className="vike-blocks-navlink" style={navGroupLinkStyle()} onClick={onClose}>
              <span style={navGroupLinkTitleStyle()}>{l.label}</span>
              {l.description != null && <span style={navGroupLinkDescStyle()}>{l.description}</span>}
            </a>
          ) : (
            <button key={i} type="button" role="menuitem" className="vike-blocks-navlink" style={navGroupLinkStyle()} onClick={onClose}>
              <span style={navGroupLinkTitleStyle()}>{l.label}</span>
              {l.description != null && <span style={navGroupLinkDescStyle()}>{l.description}</span>}
            </button>
          ),
        )}
      </div>
    </Popover>
  )
}

export function NavMenuView({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(-1)
  return (
    <>
      <style>{NAV_STYLE_TAG}</style>
      <nav data-slot="nav-menu" style={navRootStyle()}>
        {items.map((it, i) =>
          it.type === 'group' ? (
            <GroupMenu
              key={i}
              label={it.label}
              links={it.links ?? []}
              open={openIndex === i}
              onToggle={() => setOpenIndex((cur) => (cur === i ? -1 : i))}
              onClose={() => setOpenIndex((cur) => (cur === i ? -1 : cur))}
            />
          ) : (
            <a key={i} href={it.to ?? '#'} className="vike-blocks-navlink" style={navLinkStyle()}>
              {it.label}
            </a>
          ),
        )}
      </nav>
    </>
  )
}

registerBlockRenderer('nav-menu', NavMenuView)
