// The React renderer for the `stepper` block — a multi-step wizard. Theme-native (every color reads a
// vike-themes CSS var). The active step is local UI state, SEEDED from the resolved `current`, so the
// server and the first client render show the same step (no hydration mismatch). The header is a row of
// numbered/checked indicators joined by connectors that fill as steps complete; clicking a step jumps to
// it. Each step's resolved sections are drawn with <Blocks>, so a step composes any blocks. Back/Next
// walk the flow; Next is omitted on the last step (its own content — e.g. a form submit — finishes).
import { useState } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import {
  stepperRootStyle,
  stepperHeaderStyle,
  stepperItemStyle,
  stepperDotStyle,
  stepperConnectorStyle,
  stepperLabelStyle,
  stepperDescriptionStyle,
  stepperButtonStyle,
  stepState,
  STEPPER_STYLE_TAG,
} from '../blocks/stepper-styles.js'

function Check() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function StepperView({ steps = [], current = 0, nextLabel = 'Next', backLabel = 'Back' }) {
  const [active, setActive] = useState(current)
  const last = steps.length - 1
  const activeStep = steps[active] ?? steps[0]

  return (
    <div data-slot="stepper" style={stepperRootStyle()}>
      <style>{STEPPER_STYLE_TAG}</style>

      <div role="group" aria-label="Progress" style={stepperHeaderStyle()}>
        {steps.map((s, i) => {
          const state = stepState(i, active)
          return (
            <button
              key={i}
              type="button"
              className="vike-blocks-step-head"
              aria-current={state === 'current' ? 'step' : undefined}
              onClick={() => setActive(i)}
              style={{ ...stepperItemStyle(), border: 0, background: 'transparent', padding: 0, font: 'inherit' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span style={{ ...stepperConnectorStyle(i <= active && i > 0), visibility: i === 0 ? 'hidden' : 'visible' }} />
                <span data-dot={state} style={stepperDotStyle(state)}>{state === 'complete' ? <Check /> : i + 1}</span>
                <span style={{ ...stepperConnectorStyle(i < active), visibility: i === last ? 'hidden' : 'visible' }} />
              </div>
              <span style={stepperLabelStyle(state)}>{s.title}</span>
              {s.description && <span style={stepperDescriptionStyle()}>{s.description}</span>}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div key={active} className="vike-blocks-step-panel" style={{ animation: 'vike-blocks-step-in 0.25s ease' }}>
          {activeStep && <Blocks sections={activeStep.sections} />}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button type="button" disabled={active === 0} onClick={() => setActive((i) => Math.max(0, i - 1))} style={stepperButtonStyle(false, active === 0)}>
          {backLabel}
        </button>
        {active < last && (
          <button type="button" onClick={() => setActive((i) => Math.min(last, i + 1))} style={stepperButtonStyle(true, false)}>
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}

registerBlockRenderer('stepper', StepperView)
