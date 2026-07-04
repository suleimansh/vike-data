// The React renderer for the `spinner` block — a dep-free, theme-native loading spinner. The spin is
// pure CSS (the shared SPINNER_STYLE_TAG), so there's no JS and no state and SSR renders the final
// markup. `role="status"` announces it to assistive tech; a label is the accessible name, and without
// one a visually-hidden "Loading" is. Styles come from the shared spinner-styles module, so this
// can't drift from the Vue twin.
import { registerBlockRenderer } from './registry.js'
import { spinnerRingStyle, spinnerRowStyle, spinnerLabelStyle, SPINNER_STYLE_TAG } from '../blocks/spinner-styles.js'

export function SpinnerView({ size = 20, thickness = 2, tone = 'default', label = null }) {
  const labelled = label != null
  return (
    <span role="status" aria-live="polite" {...(labelled ? {} : { 'aria-label': 'Loading' })} style={labelled ? spinnerRowStyle() : { display: 'inline-flex' }}>
      <style>{SPINNER_STYLE_TAG}</style>
      <span className="vike-blocks-spinner" data-slot="spinner" style={spinnerRingStyle(size, thickness, tone)} />
      {labelled && <span style={spinnerLabelStyle()}>{label}</span>}
    </span>
  )
}

registerBlockRenderer('spinner', SpinnerView)
