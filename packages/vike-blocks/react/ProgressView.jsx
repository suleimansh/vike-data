// The React renderer for the `progress` block — a dep-free, theme-native progress bar. The determinate
// fill is a pure-CSS width (a smooth transition); the indeterminate mode is a keyframed sliding segment
// (the shared PROGRESS_STYLE_TAG). No JS and no state, so SSR renders the final markup. An optional
// caption row shows the label + value%. Styles come from the shared progress-styles module, so this
// can't drift from the Vue twin.
import { registerBlockRenderer } from './registry.js'
import { progressLabelRowStyle, progressLabelStyle, progressValueStyle, progressTrackStyle, progressFillStyle, PROGRESS_STYLE_TAG } from '../blocks/progress-styles.js'

export function ProgressView({ value = null, max = 100, percent = 0, indeterminate = false, size = 8, label = null }) {
  return (
    <div data-slot="progress-block">
      <style>{PROGRESS_STYLE_TAG}</style>
      {label != null && (
        <div style={progressLabelRowStyle()}>
          <span style={progressLabelStyle()}>{label}</span>
          {!indeterminate && <span style={progressValueStyle()}>{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        data-slot="progress"
        aria-valuemin={0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : value ?? Math.round(percent)}
        style={progressTrackStyle(size)}
      >
        {indeterminate ? (
          <div className="vike-blocks-progress-indet" data-slot="progress-indicator" />
        ) : (
          <div data-slot="progress-indicator" style={progressFillStyle(percent)} />
        )}
      </div>
    </div>
  )
}

registerBlockRenderer('progress', ProgressView)
