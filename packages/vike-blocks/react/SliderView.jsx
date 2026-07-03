// The React renderer for the `slider` block — a dep-free, theme-native range control. The rail is a
// pointer target (click or drag anywhere sets the value); the thumb is a focusable `role="slider"`
// driven by the arrow keys (Home / End jump to the ends). It tracks its own position (value binding is
// the actions axis #385), so `value` is the INITIAL position and SSR agrees with the first client
// render. The rail fill, thumb, and value math live in the shared slider-styles module, so this stays
// a thin binding and can't drift from the Vue twin.
import { useRef, useState } from 'react'
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

export function SliderView({ label, min = 0, max = 100, step = 1, value, disabled = false, name }) {
  const initial = snapToStep(value ?? min, min, max, step)
  const [val, setVal] = useState(initial)
  const trackRef = useRef(null)
  const pct = sliderPercent(val, min, max)

  // Turn a pointer x into a snapped value along the rail.
  const valueAt = (clientX) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return val
    const ratio = (clientX - rect.left) / rect.width
    return snapToStep(min + ratio * (max - min), min, max, step)
  }

  const onPointerDown = (e) => {
    if (disabled) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setVal(valueAt(e.clientX))
  }
  const onPointerMove = (e) => {
    if (disabled || !e.currentTarget.hasPointerCapture?.(e.pointerId)) return
    setVal(valueAt(e.clientX))
  }

  const onKeyDown = (e) => {
    if (disabled) return
    let next = val
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = val - step
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = val + step
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    else return
    e.preventDefault()
    setVal(snapToStep(next, min, max, step))
  }

  return (
    <div style={sliderRootStyle(disabled)} data-slot="slider">
      <style>{SLIDER_STYLE_TAG}</style>
      {label != null && (
        <span style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{label}</span>
          <span style={{ color: 'var(--color-muted, #64748b)', fontVariantNumeric: 'tabular-nums' }}>{val}</span>
        </span>
      )}
      {name != null && <input type="hidden" name={name} value={val} />}
      <div
        ref={trackRef}
        className="vike-blocks-slider"
        aria-disabled={disabled || undefined}
        style={sliderTrackStyle()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        <span style={sliderRangeStyle(pct)} />
        <span
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label ?? name}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={val}
          aria-disabled={disabled || undefined}
          className="vike-blocks-slider-thumb"
          style={sliderThumbStyle(pct)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  )
}

registerBlockRenderer('slider', SliderView)
