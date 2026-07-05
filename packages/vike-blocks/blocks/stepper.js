// The `stepper` block — a multi-step wizard: a numbered progress header (complete / current / upcoming
// steps joined by connectors) over one active step's content, with Back / Next navigation. The
// SEQUENTIAL sibling of `tabs` — where tabs show one of N peer panels, a stepper walks them in order.
// Which step is shown is local UI state in the renderer (SSR renders the initial step, so the server
// and first client render agree). Each step's sections are ordinary blocks, resolved recursively, so a
// step composes anything (a form, fields, a summary).
//
//   stepper()
//     .step('Account', [field('Email').control(input())], { description: 'How we reach you' })
//     .step('Payment', [field('Card').control(input())])
//     .step('Review',  [text('Confirm and submit.')])
//     .current(0)
//
// Next is omitted on the last step, so the final step's own content (e.g. a form's submit button)
// finishes the flow — the block stays display + navigation only (mutating is the actions axis #385).
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSections as collapse } from '../core/page.js'

// A fluent builder. `.step(title, sections, { description })` appends a step (its sections collapse now
// so nested builders become descriptors, like tabs); `.current(i)` sets the initial step; the label
// setters override the nav button text.
export function stepper() {
  const steps = []
  let current
  let nextLabel
  let backLabel
  const self = {
    step(title, sections = [], opts = {}) {
      steps.push({ title, ...(opts.description !== undefined ? { description: opts.description } : {}), sections: collapse(sections) })
      return self
    },
    current(i) {
      current = i
      return self
    },
    nextLabel(label) {
      nextLabel = label
      return self
    },
    backLabel(label) {
      backLabel = label
      return self
    },
    build() {
      return {
        block: 'stepper',
        steps: steps.map((s) => ({ ...s })),
        ...(current !== undefined ? { current } : {}),
        ...(nextLabel !== undefined ? { nextLabel } : {}),
        ...(backLabel !== undefined ? { backLabel } : {}),
      }
    },
  }
  return self
}

// Resolve each step's sections into view-models (the recursive step that makes stepper a container) and
// clamp the initial step into range. The renderer draws the progress header + the active step's resolved
// sections + the Back/Next controls; `current` is only the INITIAL step (the renderer owns live state).
registerBlock('stepper', {
  category: 'layout',
  summary: "A multi-step wizard; each step holds nested blocks.",
  container: true,
  example: "stepper().step('Account', [field('Email').control(input())]).current(0)",
  resolve({ props, tables }) {
    const steps = (props.steps ?? []).map((s) => ({
      title: s.title ?? '',
      description: s.description ?? null,
      sections: resolvePage({ sections: collapse(s.sections) }, tables).sections,
    }))
    const raw = Number.isInteger(props.current) ? props.current : 0
    const current = steps.length ? Math.min(Math.max(0, raw), steps.length - 1) : 0
    return {
      steps,
      current,
      nextLabel: props.nextLabel ?? 'Next',
      backLabel: props.backLabel ?? 'Back',
    }
  },
})
