// The React renderer for the `form` block — a non-schema form in a real, ready-to-post <form>. The
// resolved field sections are drawn with <Blocks> (so a form holds any blocks), followed by a submit
// button styled from the shared button module (so it matches the button block + themes for free).
// Submission: with `onSubmit` (a named action, #385) AND a vike-actions provider present, the form's
// values are submitted to that action via JS; otherwise the <form>'s native method/action POST does
// the work, so a form always works with no client JS (progressive enhancement).
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { useActionRunner } from './action-context.js'
import { buttonStyle, BUTTON_STYLE_TAG } from '../blocks/button-styles.js'

export function FormView({ action, method = 'post', submitLabel = 'Save', onSubmit, sections = [] }) {
  const runner = useActionRunner()
  // Intercept only when a named action is set AND a real runner is mounted; else let the native POST
  // proceed untouched (the no-JS fallback).
  const handleSubmit =
    onSubmit && runner.enabled
      ? (e) => {
          e.preventDefault()
          runner.run(onSubmit, Object.fromEntries(new FormData(e.currentTarget)))
        }
      : undefined
  return (
    <form method={method} action={action || undefined} onSubmit={handleSubmit} data-slot="form" style={{ display: 'grid', gap: '1rem' }}>
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
