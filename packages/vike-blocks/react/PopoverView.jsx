// The React renderer for the `popover` block — a dep-free, theme-native panel of arbitrary content
// anchored to a trigger. Reuses the popover primitive (anchor + outside-click + Escape + edge-aware
// flip + open-gated SSR) and draws the resolved content sections with <Blocks>, so a popover can hold
// any blocks. It tracks its own open state, so SSR renders only the trigger (no hydration mismatch).
// The trigger defaults to a themed button (shared button-styles); a resolved `trigger` block replaces
// it, wrapped in a clickable span. Panel + motion styles come from the shared popover-styles module,
// so this can't drift from the Vue twin.
import { useState } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.jsx'
import { popoverPanelStyle, popoverMotionStyle } from '../blocks/popover-styles.js'
import { buttonStyle, variantKey, BUTTON_STYLE_TAG } from '../blocks/button-styles.js'

export function PopoverView({ label = 'Open', content = [], trigger = null, variant = 'outline', side = 'bottom', align = 'start' }) {
  const [open, setOpen] = useState(false)
  const placement = `${side}-${align}`
  const toggle = () => setOpen((o) => !o)

  // A custom trigger block renders through <Blocks> inside a clickable, focusable span (Enter/Space
  // toggle) so any block can open the popover; otherwise a themed button labelled by `label`.
  const triggerNode = trigger ? (
    <span
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggle()
        }
      }}
      style={{ display: 'inline-flex', cursor: 'pointer' }}
    >
      <Blocks sections={[trigger]} />
    </span>
  ) : (
    <>
      <style>{BUTTON_STYLE_TAG}</style>
      <button
        type="button"
        className="vike-blocks-btn"
        data-slot="button"
        data-variant={variantKey(variant)}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={buttonStyle(variant)}
        onClick={toggle}
      >
        {label}
      </button>
    </>
  )

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      trigger={triggerNode}
      placement={placement}
      role="dialog"
      panelStyle={(v, pl) => ({ ...popoverPanelStyle(), ...popoverMotionStyle(v, pl) })}
    >
      <div data-slot="popover">
        <Blocks sections={content} />
      </div>
    </Popover>
  )
}

registerBlockRenderer('popover', PopoverView)
