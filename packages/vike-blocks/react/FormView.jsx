// The React renderer for the `form` block — a non-schema form in a real, ready-to-post <form>. The
// resolved field sections are drawn with <Blocks> (so a form holds any blocks), followed by a submit
// button styled from the shared button module (so it matches the button block + themes for free).
// Native submission: the <form>'s method/action do the work, so this needs no client JS — the
// richer JS-submission path is the actions axis (#385).
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { buttonStyle, BUTTON_STYLE_TAG } from '../button-styles.js'

export function FormView({ action, method = 'post', submitLabel = 'Save', sections = [] }) {
  return (
    <form method={method} action={action || undefined} data-slot="form" style={{ display: 'grid', gap: '1rem' }}>
      <Blocks sections={sections} />
      {submitLabel && (
        <div>
          <style>{BUTTON_STYLE_TAG}</style>
          <button type="submit" className="vike-blocks-btn" data-slot="form-submit" style={buttonStyle('default', 'default', false)}>
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  )
}

registerBlockRenderer('form', FormView)
