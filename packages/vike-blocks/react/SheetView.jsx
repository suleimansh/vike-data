// The React renderer for the `sheet` block — an edge-anchored side panel, built on the shared Overlay
// primitive (portal + focus-trap + Escape + backdrop-click + scroll-lock + enter/exit live there, so
// sheet/dialog/drawer can't drift). Sheet supplies only what makes it a sheet: the edge-anchored
// backdrop alignment and the slide-in transform (from sheet-styles, by side), plus the header + body.
// Theme-native (vike-themes CSS vars). Open/close is local UI state; the body is drawn with <Blocks>.
import { useState, useId } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { Overlay, overlayTriggerStyle } from './overlay.jsx'
import { sheetContainerStyle, sheetPanelStyle } from '../sheet-styles.js'

export function SheetView({ title = '', description, trigger = 'Open', side = 'right', sections = [], defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const titleId = useId()

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={overlayTriggerStyle()}>
        {trigger}
      </button>
      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        labelledBy={titleId}
        role="dialog"
        containerStyle={sheetContainerStyle(side)}
        panelStyle={(visible) => sheetPanelStyle(side, visible)}
      >
        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              {title}
            </h2>
            {description && <p style={{ margin: '0.25rem 0 0', fontSize: 14, color: 'var(--color-muted, #64748b)' }}>{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            style={{ flexShrink: 0, border: 0, background: 'transparent', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: 'var(--color-muted, #64748b)' }}
          >
            {'×'}
          </button>
        </header>
        {sections.length > 0 && <Blocks sections={sections} />}
      </Overlay>
    </>
  )
}

registerBlockRenderer('sheet', SheetView)
