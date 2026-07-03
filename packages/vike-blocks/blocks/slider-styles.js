// Shared, framework-agnostic style + math data for the `slider` block, imported by BOTH the react and
// vue renderers so the surface can't drift. Dep-free, theme-native (every color reads a vike-themes
// CSS var, with a fallback). A range control is a rail whose left portion fills with the primary color
// up to the thumb; the thumb sits at the value's percent along the rail. The :focus-visible ring rides
// the `vike-blocks-slider-thumb` class + SLIDER_STYLE_TAG (a static, identical-everywhere <style>).
import { clamp } from './_shared.js'

// The value's position along the rail, as a 0-100 percent (clamped). A degenerate range (max <= min)
// pins to 0 so the thumb can't fly off or divide by zero.
export function sliderPercent(value, min, max) {
  if (!(max > min)) return 0
  const pct = ((value - min) / (max - min)) * 100
  return pct < 0 ? 0 : pct > 100 ? 100 : pct
}

// Snap a raw (continuous) value to the nearest step and clamp it into [min, max]. Used by the
// renderers to turn a pointer position or an arrow-key nudge into a legal value.
export function snapToStep(raw, min, max, step) {
  const s = step > 0 ? step : 1
  const snapped = Math.round((raw - min) / s) * s + min
  return clamp(snapped, min, max)
}

// The wrapper: the label above, the rail below.
export function sliderRootStyle(disabled) {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    margin: '0.5rem 0',
    font: 'inherit',
    fontSize: '14px',
    lineHeight: 1.4,
    color: 'var(--color-text, #0f172a)',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'default' : 'pointer',
    userSelect: 'none',
    touchAction: 'none',
  }
}

// The rail: a neutral rounded track that the range fill and thumb ride on.
export function sliderTrackStyle() {
  return {
    position: 'relative',
    width: '100%',
    height: '0.375rem',
    borderRadius: '999px',
    background: 'var(--color-surface, #e2e8f0)',
    boxSizing: 'border-box',
  }
}

// The filled portion: from the left edge up to the thumb, in the primary color.
export const sliderRangeStyle = (pct) => ({
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  width: pct + '%',
  borderRadius: '999px',
  background: 'var(--color-primary, #2563eb)',
})

// The thumb: a knob centered on the value's percent along the rail.
export const sliderThumbStyle = (pct) => ({
  position: 'absolute',
  top: '50%',
  left: pct + '%',
  width: '1rem',
  height: '1rem',
  borderRadius: '999px',
  background: 'var(--color-bg, #ffffff)',
  border: '2px solid var(--color-primary, #2563eb)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  transform: 'translate(-50%, -50%)',
  transition: 'box-shadow .15s ease, border-color .15s ease',
})

// The static <style> for the interactive states: a focus-visible ring on the thumb and a dimmed
// disabled rail.
export const SLIDER_STYLE_TAG =
  '.vike-blocks-slider-thumb:focus-visible{outline:none;box-shadow:0 0 0 2px var(--color-bg,#fff),0 0 0 4px var(--color-ring,var(--color-primary,#2563eb))}' +
  '.vike-blocks-slider[aria-disabled="true"]{cursor:default}'
