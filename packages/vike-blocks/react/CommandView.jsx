// The React renderer for the `command` block — a dep-free, theme-native ⌘K command palette on the shared
// Overlay primitive (portal + focus-trap + Escape + backdrop + scroll-lock live there). A trigger button
// and a global ⌘K / Ctrl+K hotkey open the modal; the search input filters the grouped items, arrow-keys
// move the active item, Enter runs it (navigates to `to`). SSR renders only the trigger (the modal is
// client + open-gated), so there's no hydration mismatch. Styles come from the shared command-styles
// module, so this can't drift from the Vue twin.
import { useState, useEffect } from 'react'
import { registerBlockRenderer } from './registry.js'
import { Overlay, ENTER_MS } from './overlay.jsx'
import { OVERLAY_EASE, OVERLAY_BACKDROP_EASE } from '../overlay-motion.js'
import {
  filterCommands,
  SEARCH_ICON,
  commandTriggerStyle,
  commandKbdStyle,
  commandInputWrapStyle,
  commandInputStyle,
  commandListStyle,
  commandGroupHeadingStyle,
  commandItemStyle,
  commandShortcutStyle,
  commandEmptyStyle,
  COMMAND_STYLE_TAG,
} from '../command-styles.js'

const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx={SEARCH_ICON.circle.cx} cy={SEARCH_ICON.circle.cy} r={SEARCH_ICON.circle.r} />
    <path d={SEARCH_ICON.path} />
  </svg>
)

// The palette box: drops in from just above with a subtle scale, on the shared overlay curves.
const panelStyle = (visible) => ({
  width: '100%',
  maxWidth: 520,
  background: 'var(--color-bg, #ffffff)',
  color: 'var(--color-text, #0f172a)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(-8px)',
  transition: `opacity ${ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}, transform ${ENTER_MS}ms ${OVERLAY_EASE}`,
})

export function CommandView({ placeholder = 'Type a command or search...', empty = 'No results found.', hotkey = 'k', trigger = 'Search...', groups = [] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  // Global ⌘K / Ctrl+K toggles the palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hotkey])

  const { groups: shown, flat } = filterCommands(groups, query)

  const select = (item) => {
    setOpen(false)
    setQuery('')
    if (item?.to && typeof window !== 'undefined') window.location.assign(item.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const it = flat[active]
      if (it) select(it)
    }
  }

  let idx = -1 // running flat index across groups, for highlight + Enter mapping

  return (
    <>
      <style>{COMMAND_STYLE_TAG}</style>
      <button type="button" className="vike-blocks-cmd-trigger" data-slot="command-trigger" style={commandTriggerStyle()} onClick={() => { setOpen(true); setQuery(''); setActive(0) }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <SearchIcon />
          {trigger}
        </span>
        <span style={commandKbdStyle()}>{`⌘${hotkey.toUpperCase()}`}</span>
      </button>
      <Overlay open={open} onClose={() => setOpen(false)} role="dialog" containerStyle={{ alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', paddingTop: '12vh' }} panelStyle={panelStyle}>
        <div data-slot="command" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={commandInputWrapStyle()}>
            <SearchIcon size={18} />
            <input className="vike-blocks-cmd-input" data-slot="command-input" autoFocus value={query} placeholder={placeholder} onChange={(e) => { setQuery(e.target.value); setActive(0) }} onKeyDown={onKeyDown} style={commandInputStyle()} />
          </div>
          <div role="listbox" data-slot="command-list" style={commandListStyle()}>
            {flat.length === 0 ? (
              <div data-slot="command-empty" style={commandEmptyStyle()}>{empty}</div>
            ) : (
              shown.map((g, gi) => (
                <div key={gi} data-slot="command-group">
                  {g.label && <div style={commandGroupHeadingStyle()}>{g.label}</div>}
                  {g.items.map((it) => {
                    idx += 1
                    const myIdx = idx
                    const on = myIdx === active
                    return (
                      <div
                        key={myIdx}
                        role="option"
                        data-slot="command-item"
                        aria-selected={on}
                        data-active={on ? 'true' : undefined}
                        onMouseEnter={() => setActive(myIdx)}
                        onMouseDown={(e) => { e.preventDefault(); select(it) }}
                        style={commandItemStyle(on)}
                      >
                        <span>{it.label}</span>
                        {it.shortcut && <span data-slot="command-shortcut" style={commandShortcutStyle()}>{it.shortcut}</span>}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </Overlay>
    </>
  )
}

registerBlockRenderer('command', CommandView)
