// The Vue renderer for the `confirm` block — the Vue twin of react/ConfirmView.jsx, an alert dialog on
// the shared Overlay primitive. Progressive enhancement: in `action` mode it renders a real <form> that
// submits with NO client JS; hydrated, the submit is intercepted and gated behind the themed dialog
// (a themed window.confirm). Without an action it navigates on confirm (`to`) or just closes. The
// buttons reuse the button block's styles. SSR renders only the form/trigger (the dialog is client +
// open-gated), so there's no hydration mismatch.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { Overlay, ENTER_MS } from './overlay.js'
import { OVERLAY_EASE, OVERLAY_BACKDROP_EASE } from '../core/overlay-motion.js'
import { buttonStyle, BUTTON_STYLE_TAG } from '../blocks/button-styles.js'

let uid = 0

// The centered panel — the same gentle flip + scale as the dialog block (shared decelerate curve).
const panelStyle = (visible) => ({
  width: '100%',
  maxWidth: '420px',
  padding: '1.25rem',
  background: 'var(--color-bg, #ffffff)',
  color: 'var(--color-text, #0f172a)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
  opacity: visible ? 1 : 0,
  filter: visible ? 'blur(0px)' : 'blur(3px)',
  transform: visible ? 'perspective(500px) rotateX(0deg) scale(1)' : 'perspective(500px) rotateX(-12deg) scale(0.95)',
  transition: `opacity ${ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}, filter ${ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}, transform ${ENTER_MS}ms ${OVERLAY_EASE}`,
})

const linkTriggerStyle = (danger) => ({
  background: 'transparent',
  color: danger ? 'var(--color-danger, #c0392b)' : 'var(--color-primary, #2563eb)',
  border: 'none',
  padding: 0,
  fontSize: '14px',
  fontFamily: 'inherit',
  cursor: 'pointer',
})

export const ConfirmView = {
  props: ['label', 'title', 'description', 'confirmLabel', 'cancelLabel', 'intent', 'link', 'action', 'fields', 'to'],
  setup(props) {
    const open = ref(false)
    const formEl = ref(null)
    const titleId = `vike-blocks-confirm-${uid++}`

    const doConfirm = () => {
      open.value = false
      if (props.action) formEl.value?.submit()
      else if (props.to && typeof window !== 'undefined') window.location.assign(props.to)
    }

    return () => {
      const label = props.label ?? 'Confirm'
      const danger = props.intent === 'danger'
      const cLabel = props.confirmLabel ?? label
      const triggerStyle = props.link ? linkTriggerStyle(danger) : buttonStyle(danger ? 'danger' : 'primary', 'default')

      const panelChildren = [
        h('style', BUTTON_STYLE_TAG),
        h('h2', { id: titleId, style: { margin: 0, fontSize: '18px', fontWeight: 600 } }, props.title ?? 'Are you sure?'),
        props.description ? h('p', { style: { margin: '0.4rem 0 0', fontSize: '14px', color: 'var(--color-muted, #64748b)', lineHeight: 1.5 } }, props.description) : null,
        h('div', { style: { marginTop: '1.4rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' } }, [
          h('button', { type: 'button', class: 'vike-blocks-btn', style: buttonStyle('outline', 'default'), onClick: () => (open.value = false) }, props.cancelLabel ?? 'Cancel'),
          h('button', { type: 'button', class: 'vike-blocks-btn', style: buttonStyle(danger ? 'danger' : 'primary', 'default'), onClick: doConfirm }, cLabel),
        ]),
      ]

      const overlay = h(
        Overlay,
        {
          open: open.value,
          onClose: () => (open.value = false),
          labelledBy: titleId,
          role: 'alertdialog',
          containerStyle: { alignItems: 'center', justifyContent: 'center', padding: '1rem' },
          panelStyle,
        },
        { default: () => panelChildren },
      )

      // Form mode: a real <form> that submits with no JS; hydrated, the submit opens the dialog first.
      if (props.action) {
        const hidden = (props.fields ?? []).map((f, i) => h('input', { key: i, type: 'hidden', name: f.name, value: f.value }))
        return h('span', { 'data-slot': 'confirm' }, [
          h('style', BUTTON_STYLE_TAG),
          h(
            'form',
            {
              ref: formEl,
              method: props.action.method,
              action: props.action.to,
              onSubmit: (e) => {
                e.preventDefault()
                open.value = true
              },
              style: { display: 'inline', margin: 0 },
            },
            [...hidden, h('button', { type: 'submit', class: props.link ? undefined : 'vike-blocks-btn', style: triggerStyle }, label)],
          ),
          overlay,
        ])
      }

      // Nav / display mode: the trigger just opens the dialog.
      return h('span', { 'data-slot': 'confirm' }, [
        h('style', BUTTON_STYLE_TAG),
        h('button', { type: 'button', class: props.link ? undefined : 'vike-blocks-btn', style: triggerStyle, onClick: () => (open.value = true) }, label),
        overlay,
      ])
    }
  },
}

registerBlockRenderer('confirm', ConfirmView)
