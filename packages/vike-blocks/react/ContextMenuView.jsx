// The React renderer for the `context-menu` block — a dep-free, non-modal menu portalled to <body> and
// pinned at the cursor. Right-clicking the wrapped region opens it; it measures itself, flips at the
// viewport edge (clampMenuPosition), then reveals + focuses the first item. It reuses the dropdown menu
// chrome (item / separator / heading rows + DROPDOWN_STYLE_TAG + moveMenuFocus roving) and the popover
// surface box, so it can't drift from the dropdown. Closes on outside pointer-down / Escape / scroll /
// resize / pick. SSR renders only the trigger (the menu is client + open-gated) = no hydration mismatch.
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { registerBlockRenderer } from './registry.js'
import { Blocks } from './Blocks.jsx'
import { popoverSurfaceStyle } from '../blocks/popover-styles.js'
import { dropdownItemStyle, dropdownSeparatorStyle, dropdownHeadingStyle, DROPDOWN_STYLE_TAG, moveMenuFocus } from '../blocks/dropdown-styles.js'
import { clampMenuPosition, contextTriggerStyle, contextPanelStyle } from '../blocks/context-menu-styles.js'

const useIsoLayout = typeof document !== 'undefined' ? useLayoutEffect : useEffect

export function ContextMenuView({ items = [], trigger = null }) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef(null)
  const menuRef = useRef(null)
  const lastFocused = useRef(null)

  useEffect(() => setMounted(true), [])

  const openAt = (e) => {
    e.preventDefault()
    // Capture the opener only on a fresh open — re-right-clicking while open must not overwrite it with
    // a menu item that unmounts on close (which would drop focus instead of restoring it).
    if (!open && typeof document !== 'undefined') lastFocused.current = document.activeElement
    setCursor({ x: e.clientX, y: e.clientY })
    setVisible(false)
    setOpen(true)
  }
  const close = () => setOpen(false)

  // Once open, measure the panel (rendered hidden), clamp it into the viewport, reveal, and focus the
  // first enabled item. Runs before paint so the (0,0) hidden frame never shows.
  useIsoLayout(() => {
    if (!open || !panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    setPos(clampMenuPosition(cursor, { width: rect.width, height: rect.height }, { width: window.innerWidth, height: window.innerHeight }))
    setVisible(true)
    // Focus the first enabled item, else the menu panel itself, so an empty / all-disabled menu still
    // takes focus (Escape closes it, screen readers announce it) instead of leaving focus behind.
    ;(menuRef.current?.querySelector('[role="menuitem"]:not([aria-disabled="true"])') || panelRef.current)?.focus()
  }, [open, cursor])

  // Close on an outside pointer-down / Escape / scroll / resize.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    const onShift = () => close()
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onShift, true)
    window.addEventListener('resize', onShift)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onShift, true)
      window.removeEventListener('resize', onShift)
    }
  }, [open])

  // Restore focus to the opener after close.
  useEffect(() => {
    if (!open && lastFocused.current) {
      lastFocused.current.focus?.()
      lastFocused.current = null
    }
  }, [open])

  const onMenuKeyDown = (e) => {
    if (moveMenuFocus(menuRef.current, e.key)) e.preventDefault()
  }

  const menu =
    open && mounted
      ? createPortal(
          <div ref={panelRef} role="menu" tabIndex={-1} style={{ ...popoverSurfaceStyle(), ...contextPanelStyle(pos, visible) }} onKeyDown={onMenuKeyDown} onContextMenu={(e) => e.preventDefault()}>
            <style>{DROPDOWN_STYLE_TAG}</style>
            <div ref={menuRef}>
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
                    close()
                  },
                }
                return it.to != null && !it.disabled ? (
                  <a key={i} href={it.to} {...common}>{it.label}</a>
                ) : (
                  <button key={i} type="button" disabled={it.disabled} {...common}>{it.label}</button>
                )
              })}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div data-slot="context-menu" style={{ display: 'inline-block' }}>
      <div onContextMenu={openAt}>{trigger ? <Blocks sections={[trigger]} /> : <div style={contextTriggerStyle()}>Right-click here</div>}</div>
      {menu}
    </div>
  )
}

registerBlockRenderer('context-menu', ContextMenuView)
