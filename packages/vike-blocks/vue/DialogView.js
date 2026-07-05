// The Vue renderer for the `dialog` block — the Vue twin of react/DialogView.jsx, a centered modal
// built on the shared Overlay primitive (portal + focus-trap + Escape + backdrop-click + scroll-lock +
// enter/exit lifecycle live there, so dialog/sheet/drawer can't drift). Dialog supplies only what makes
// it a dialog: the centered backdrop alignment, a flip-in + scale enter transform, and the header /
// close / body / footer content. Theme-native; the body/footer sections are drawn with <Blocks>.
import { h, ref, useId } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { Overlay, overlayTriggerStyle } from './overlay.js'
import { overlayPanelStyle } from '../core/overlay-motion.js'

// The centered dialog panel: the shared tilt-in modal surface (blur + perspective flip + scale).
const panelStyle = (visible) => overlayPanelStyle(visible, { maxWidth: 440 })

export const DialogView = {
  props: ['title', 'description', 'trigger', 'sections', 'footer', 'defaultOpen'],
  setup(props) {
    const open = ref(!!props.defaultOpen)
    const titleId = `vike-blocks-dialog-${useId()}`

    return () => {
      const sections = props.sections ?? []
      const footer = props.footer ?? []

      const triggerBtn = h('button', { type: 'button', onClick: () => (open.value = true), style: overlayTriggerStyle() }, props.trigger ?? 'Open')

      const header = h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' } }, [
        h('div', [
          h('h2', { id: titleId, style: { margin: 0, fontSize: '18px', fontWeight: 600 } }, props.title ?? ''),
          props.description ? h('p', { style: { margin: '0.25rem 0 0', fontSize: '14px', color: 'var(--color-muted, #64748b)' } }, props.description) : null,
        ]),
        h(
          'button',
          {
            type: 'button',
            'aria-label': 'Close',
            onClick: () => (open.value = false),
            style: { flexShrink: 0, border: 0, background: 'transparent', cursor: 'pointer', fontSize: '22px', lineHeight: 1, color: 'var(--color-muted, #64748b)' },
          },
          '×',
        ),
      ])

      const panelChildren = [
        header,
        sections.length > 0 ? h('div', { style: { marginTop: '0.85rem' } }, h(Blocks, { sections })) : null,
        // A dialog footer is dismiss actions: clicking any footer button closes the dialog (a button
        // that also mutates data is the actions axis, #385). A footer link still navigates.
        footer.length > 0
          ? h(
              'div',
              {
                onClick: (e) => {
                  if (e.target.closest('button')) open.value = false
                },
                style: { marginTop: '1.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
              },
              h(Blocks, { sections: footer }),
            )
          : null,
      ]

      const overlay = h(
        Overlay,
        {
          open: open.value,
          onClose: () => (open.value = false),
          labelledBy: titleId,
          role: 'dialog',
          containerStyle: { alignItems: 'center', justifyContent: 'center', padding: '1rem' },
          panelStyle,
        },
        { default: () => panelChildren },
      )

      return h('span', { 'data-slot': 'dialog' }, [triggerBtn, overlay])
    }
  },
}

registerBlockRenderer('dialog', DialogView)
