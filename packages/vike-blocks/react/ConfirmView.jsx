// The React renderer for the `confirm` block — an alert dialog on the shared Overlay primitive (portal
// + focus-trap + Escape + backdrop-click + scroll-lock + enter/exit live there). Progressive
// enhancement: in `action` mode it renders a real <form>, so the trigger submits natively with NO
// client JS; once hydrated, the submit is intercepted and gated behind the themed dialog (a themed
// window.confirm). Without an action it navigates on confirm (`to`) or just closes. The buttons reuse
// the button block's styles, so a confirm can't drift from the rest of the catalog. SSR renders only
// the form/trigger (the dialog is client + open-gated), so there's no hydration mismatch.
import { useState, useRef, useId } from 'react'
import { registerBlockRenderer } from './registry.js'
import { Overlay } from './overlay.jsx'
import { overlayPanelStyle } from '../core/overlay-motion.js'
import { buttonStyle, BUTTON_STYLE_TAG } from '../blocks/button-styles.js'

// The centered panel — the same shared tilt-in modal surface as the dialog block.
const panelStyle = (visible) => overlayPanelStyle(visible, { maxWidth: 420 })

// The compact text-link trigger (for `.link()`), colored by intent.
const linkTriggerStyle = (danger) => ({
  background: 'transparent',
  color: danger ? 'var(--color-danger, #c0392b)' : 'var(--color-primary, #2563eb)',
  border: 'none',
  padding: 0,
  fontSize: 14,
  fontFamily: 'inherit',
  cursor: 'pointer',
})

export function ConfirmView({ label = 'Confirm', title = 'Are you sure?', description = null, confirmLabel, cancelLabel = 'Cancel', intent = 'primary', link = false, action = null, fields = [], to = null }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef(null)
  const titleId = useId()
  const danger = intent === 'danger'
  const cLabel = confirmLabel ?? label
  const triggerStyle = link ? linkTriggerStyle(danger) : buttonStyle(danger ? 'danger' : 'primary', 'default')

  const doConfirm = () => {
    setOpen(false)
    if (action) formRef.current?.submit() // native POST (skips the onSubmit interceptor)
    else if (to && typeof window !== 'undefined') window.location.assign(to)
  }

  const modal = (
    <Overlay
      open={open}
      onClose={() => setOpen(false)}
      labelledBy={titleId}
      role="alertdialog"
      containerStyle={{ alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      panelStyle={panelStyle}
    >
      <style>{BUTTON_STYLE_TAG}</style>
      <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
        {title}
      </h2>
      {description && <p style={{ margin: '0.4rem 0 0', fontSize: 14, color: 'var(--color-muted, #64748b)', lineHeight: 1.5 }}>{description}</p>}
      <div style={{ marginTop: '1.4rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="vike-blocks-btn" style={buttonStyle('outline', 'default')} onClick={() => setOpen(false)}>
          {cancelLabel}
        </button>
        <button type="button" className="vike-blocks-btn" style={buttonStyle(danger ? 'danger' : 'primary', 'default')} onClick={doConfirm}>
          {cLabel}
        </button>
      </div>
    </Overlay>
  )

  // Form mode: a real <form> that submits with no JS; hydrated, the submit opens the dialog first.
  if (action) {
    return (
      <>
        <style>{BUTTON_STYLE_TAG}</style>
        <form ref={formRef} method={action.method} action={action.to} onSubmit={(e) => { e.preventDefault(); setOpen(true) }} style={{ display: 'inline', margin: 0 }}>
          {fields.map((f, i) => (
            <input key={i} type="hidden" name={f.name} value={f.value} readOnly />
          ))}
          <button type="submit" className={link ? undefined : 'vike-blocks-btn'} style={triggerStyle}>
            {label}
          </button>
        </form>
        {modal}
      </>
    )
  }

  // Nav / display mode: the trigger just opens the dialog.
  return (
    <>
      <style>{BUTTON_STYLE_TAG}</style>
      <button type="button" className={link ? undefined : 'vike-blocks-btn'} style={triggerStyle} onClick={() => setOpen(true)}>
        {label}
      </button>
      {modal}
    </>
  )
}

registerBlockRenderer('confirm', ConfirmView)
