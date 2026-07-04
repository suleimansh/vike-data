// The React renderer for the `dialog` block — a centered modal, built on the shared Overlay primitive
// (portal + focus-trap + Escape + backdrop-click + scroll-lock + enter/exit lifecycle live there, so
// dialog/sheet/drawer can't drift). Dialog supplies only what makes it a dialog: the centered backdrop
// alignment, a flip-in + scale enter transform, and the header / close / body / footer content. Theme-
// native (vike-themes CSS vars). Open/close is local UI state; the body/footer sections are drawn with
// <Blocks>, so a dialog can hold any blocks.
import { useState, useId } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { Overlay, overlayTriggerStyle } from './overlay.jsx'
import { overlayPanelStyle } from '../core/overlay-motion.js'

// The centered dialog panel: the shared tilt-in modal surface (blur + perspective flip + scale).
const panelStyle = (visible) => overlayPanelStyle(visible, { maxWidth: 440 })

export function DialogView({ title = '', description, trigger = 'Open', sections = [], footer = [], defaultOpen = false }) {
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
        containerStyle={{ alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        panelStyle={panelStyle}
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
        {sections.length > 0 && (
          <div style={{ marginTop: '0.85rem' }}>
            <Blocks sections={sections} />
          </div>
        )}
        {footer.length > 0 && (
          // A dialog footer is dismiss actions: clicking any footer button closes the dialog (a
          // button that also mutates data is the actions axis, #385). A footer link still navigates.
          <div
            onClick={(e) => {
              if (e.target.closest('button')) setOpen(false)
            }}
            style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
          >
            <Blocks sections={footer} />
          </div>
        )}
      </Overlay>
    </>
  )
}

registerBlockRenderer('dialog', DialogView)
