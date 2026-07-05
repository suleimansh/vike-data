// The Vue renderer for the `stepper` block — the Vue twin of react/StepperView.jsx. A multi-step wizard
// over the shared style module. The active step is local state, SEEDED from the resolved `current`, so
// the server and the first client render show the same step (no hydration mismatch). Header indicators
// (numbered / checked) join via connectors that fill as steps complete; clicking a step jumps to it.
// Each step's resolved sections draw with <Blocks>. Back/Next walk the flow; Next is omitted on the last
// step so the step's own content finishes.
import { h, ref } from 'vue'
import { Blocks } from './Blocks.js'
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

const check = () =>
  h('svg', { 'aria-hidden': 'true', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '20 6 9 17 4 12' }),
  ])

export const StepperView = {
  props: ['steps', 'current', 'nextLabel', 'backLabel'],
  setup(props) {
    const active = ref(Number.isInteger(props.current) ? props.current : 0)
    return () => {
      const steps = props.steps ?? []
      const last = steps.length - 1
      const activeStep = steps[active.value] ?? steps[0]

      const header = h(
        'div',
        { role: 'list', style: stepperHeaderStyle() },
        steps.map((s, i) => {
          const state = stepState(i, active.value)
          return h(
            'button',
            {
              key: i,
              type: 'button',
              class: 'vike-blocks-step-head',
              role: 'listitem',
              'aria-current': state === 'current' ? 'step' : undefined,
              onClick: () => (active.value = i),
              style: { ...stepperItemStyle(), border: 0, background: 'transparent', padding: 0, font: 'inherit' },
            },
            [
              h('div', { style: { display: 'flex', alignItems: 'center', width: '100%' } }, [
                h('span', { style: { ...stepperConnectorStyle(i <= active.value && i > 0), visibility: i === 0 ? 'hidden' : 'visible' } }),
                h('span', { 'data-dot': state, style: stepperDotStyle(state) }, state === 'complete' ? check() : i + 1),
                h('span', { style: { ...stepperConnectorStyle(i < active.value), visibility: i === last ? 'hidden' : 'visible' } }),
              ]),
              h('span', { style: stepperLabelStyle(state) }, s.title),
              s.description ? h('span', { style: stepperDescriptionStyle() }, s.description) : null,
            ],
          )
        }),
      )

      const panel = h('div', { style: { marginTop: '1.5rem' } }, [
        h('div', { key: active.value, class: 'vike-blocks-step-panel', role: 'tabpanel', style: { animation: 'vike-blocks-step-in 0.25s ease' } }, activeStep ? [h(Blocks, { sections: activeStep.sections })] : []),
      ])

      const nav = h('div', { style: { marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' } }, [
        h('button', { type: 'button', disabled: active.value === 0, onClick: () => (active.value = Math.max(0, active.value - 1)), style: stepperButtonStyle(false, active.value === 0) }, props.backLabel ?? 'Back'),
        active.value < last ? h('button', { type: 'button', onClick: () => (active.value = Math.min(last, active.value + 1)), style: stepperButtonStyle(true, false) }, props.nextLabel ?? 'Next') : null,
      ])

      return h('div', { 'data-slot': 'stepper', style: stepperRootStyle() }, [h('style', STEPPER_STYLE_TAG), header, panel, nav])
    }
  },
}

registerBlockRenderer('stepper', StepperView)
