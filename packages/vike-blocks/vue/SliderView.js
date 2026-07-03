// The Vue renderer for the `slider` block — the Vue twin of react/SliderView.jsx, a dep-free,
// theme-native range control. The rail is a pointer target (click or drag anywhere sets the value);
// the thumb is a focusable `role="slider"` driven by the arrow keys (Home / End jump to the ends). It
// tracks its own position (binding is the actions axis #385), so `value` is the INITIAL position and
// SSR agrees with the first client render. Shares the rail fill, thumb, and value math with the React
// renderer via slider-styles, so they can't drift.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import {
  sliderPercent,
  snapToStep,
  sliderRootStyle,
  sliderTrackStyle,
  sliderRangeStyle,
  sliderThumbStyle,
  SLIDER_STYLE_TAG,
} from '../blocks/slider-styles.js'

export const SliderView = {
  props: ['label', 'min', 'max', 'step', 'value', 'disabled', 'name'],
  setup(props) {
    const min = props.min ?? 0
    const max = props.max ?? 100
    const step = props.step ?? 1
    const val = ref(snapToStep(props.value ?? min, min, max, step))
    const track = ref(null)

    const valueAt = (clientX) => {
      const rect = track.value?.getBoundingClientRect()
      if (!rect || rect.width === 0) return val.value
      const ratio = (clientX - rect.left) / rect.width
      return snapToStep(min + ratio * (max - min), min, max, step)
    }
    const onPointerDown = (e) => {
      if (props.disabled) return
      e.currentTarget.setPointerCapture?.(e.pointerId)
      val.value = valueAt(e.clientX)
    }
    const onPointerMove = (e) => {
      if (props.disabled || !e.currentTarget.hasPointerCapture?.(e.pointerId)) return
      val.value = valueAt(e.clientX)
    }
    const onKeyDown = (e) => {
      if (props.disabled) return
      let next = val.value
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = val.value - step
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = val.value + step
      else if (e.key === 'Home') next = min
      else if (e.key === 'End') next = max
      else return
      e.preventDefault()
      val.value = snapToStep(next, min, max, step)
    }

    return () => {
      const pct = sliderPercent(val.value, min, max)
      return h('div', { style: sliderRootStyle(props.disabled), 'data-slot': 'slider' }, [
        h('style', SLIDER_STYLE_TAG),
        props.label != null
          ? h('span', { style: { display: 'flex', justifyContent: 'space-between' } }, [
              h('span', props.label),
              h('span', { style: { color: 'var(--color-muted, #64748b)', fontVariantNumeric: 'tabular-nums' } }, String(val.value)),
            ])
          : null,
        props.name != null ? h('input', { type: 'hidden', name: props.name, value: val.value }) : null,
        h(
          'div',
          {
            ref: track,
            class: 'vike-blocks-slider',
            'aria-disabled': props.disabled || undefined,
            style: sliderTrackStyle(),
            onPointerdown: onPointerDown,
            onPointermove: onPointerMove,
          },
          [
            h('span', { style: sliderRangeStyle(pct) }),
            h('span', {
              role: 'slider',
              tabindex: props.disabled ? -1 : 0,
              'aria-label': props.label ?? props.name,
              'aria-valuemin': min,
              'aria-valuemax': max,
              'aria-valuenow': val.value,
              'aria-disabled': props.disabled || undefined,
              class: 'vike-blocks-slider-thumb',
              style: sliderThumbStyle(pct),
              onKeydown: onKeyDown,
            }),
          ],
        ),
      ])
    }
  },
}

registerBlockRenderer('slider', SliderView)
