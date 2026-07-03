// The React renderer for the `dropdown` block — a dep-free, theme-native menu anchored below its
// trigger. Reuses the popover primitive (anchor + outside-click + Escape + open-gated SSR) and adds
// roving arrow-key focus between items. Each item is a role="menuitem" (a link when `to` is set, else a
// button — the mutating behaviour is the actions axis #385); picking one closes the menu. It tracks its
// own open state, so SSR renders only the trigger (no hydration mismatch). The trigger / item / panel
// styles live in the shared dropdown-styles + popover-styles modules, so this can't drift from the Vue twin.
import { useState, useRef } from 'react'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.jsx'
import { popoverSurfaceStyle, popoverMotionStyle } from '../blocks/popover-styles.js'
import { dropdownPlacement, dropdownTriggerStyle, dropdownItemStyle, dropdownSeparatorStyle, dropdownHeadingStyle, DROPDOWN_STYLE_TAG, moveMenuFocus } from '../blocks/dropdown-styles.js'

export function DropdownView({ label = 'Menu', items = [], align = 'start', side = 'bottom' }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const placement = dropdownPlacement(side, align)

  const trigger = (
    <>
      <style>{DROPDOWN_STYLE_TAG}</style>
      <button type="button" className="vike-blocks-menutrigger" aria-haspopup="menu" aria-expanded={open} style={dropdownTriggerStyle()} onClick={() => setOpen((o) => !o)}>
        <span>{label}</span>
        <span aria-hidden="true" style={{ fontSize: 11 }}>{'▾'}</span>
      </button>
    </>
  )

  const onKeyDown = (e) => {
    if (moveMenuFocus(menuRef.current, e.key)) e.preventDefault()
  }

  return (
    <Popover open={open} onClose={() => setOpen(false)} trigger={trigger} placement={placement} role="menu" panelStyle={(v, pl) => ({ ...popoverSurfaceStyle(), ...popoverMotionStyle(v, pl) })}>
      <div ref={menuRef} onKeyDown={onKeyDown} data-slot="dropdown-menu">
        {items.map((it, i) => {
          if (it.type === 'separator') return <div key={i} role="separator" style={dropdownSeparatorStyle()} />
          if (it.type === 'heading') return <div key={i} style={dropdownHeadingStyle()}>{it.label}</div>
          const common = {
            role: 'menuitem',
            className: 'vike-blocks-menuitem',
            'aria-disabled': it.disabled ? true : undefined,
            style: dropdownItemStyle(!!it.disabled),
            onClick: (e) => {
              if (it.disabled) {
                e.preventDefault()
                return
              }
              setOpen(false)
            },
          }
          return it.to != null && !it.disabled ? (
            <a key={i} href={it.to} {...common}>{it.label}</a>
          ) : (
            <button key={i} type="button" disabled={it.disabled} {...common}>{it.label}</button>
          )
        })}
      </div>
    </Popover>
  )
}

registerBlockRenderer('dropdown', DropdownView)
