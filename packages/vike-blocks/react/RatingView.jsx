// The React renderer for the `rating` block — a dep-free, theme-native star rating. The star row is a
// focusable role="slider" (arrow keys adjust; Home/End jump to the ends); moving the pointer previews a
// rating and clicking commits it. It tracks its own value (binding is the actions axis #385), so `value`
// is the INITIAL rating and SSR agrees with the first client render. Each star is an outline with a
// colored fill layer clipped to its fraction, so half ratings show half-filled stars. A read-only /
// disabled rating renders the same stars with no interaction. The value + fill math and styles live in
// the shared rating-styles module, so this stays a thin binding and can't drift from the Vue twin.
import { useRef, useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import {
  STAR_PATH,
  snapRating,
  ratingValueAt,
  starFill,
  ratingRootStyle,
  ratingLabelStyle,
  ratingValueReadout,
  ratingRowStyle,
  starCellStyle,
  starFillClipStyle,
  STAR_EMPTY_COLOR,
  STAR_FILL_COLOR,
  RATING_STYLE_TAG,
} from '../blocks/rating-styles.js'

const SIZE = 22

function Star({ fill }) {
  return (
    <span style={starCellStyle(SIZE)}>
      <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR_PATH} fill={STAR_EMPTY_COLOR} /></svg>
      <span className="vike-blocks-rating-fill" style={starFillClipStyle(fill)}>
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR_PATH} fill={STAR_FILL_COLOR} /></svg>
      </span>
    </span>
  )
}

export function RatingView({ label, value, max = 5, allowHalf = false, readOnly = false, disabled = false, name }) {
  const interactive = !readOnly && !disabled
  const [val, setVal] = useState(snapRating(value ?? 0, max, allowHalf))
  const [hover, setHover] = useState(null)
  const rowRef = useRef(null)
  const display = hover ?? val
  const unit = allowHalf ? 0.5 : 1

  const onPointerMove = (e) => {
    if (!interactive) return
    setHover(ratingValueAt(e.clientX, rowRef.current?.getBoundingClientRect(), max, allowHalf))
  }
  const onClick = (e) => {
    if (!interactive) return
    const v = ratingValueAt(e.clientX, rowRef.current?.getBoundingClientRect(), max, allowHalf)
    if (v != null) setVal(v)
  }
  const onKeyDown = (e) => {
    if (!interactive) return
    let next = val
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = val - unit
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = val + unit
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = max
    else return
    e.preventDefault()
    setVal(snapRating(next, max, allowHalf))
  }

  const stars = Array.from({ length: max }, (_, i) => <Star key={i} fill={starFill(i, display)} />)

  return (
    <div style={ratingRootStyle(disabled)} data-slot="rating">
      <style>{RATING_STYLE_TAG}</style>
      {label != null && (
        <span style={ratingLabelStyle()}>
          <span>{label}</span>
          <span style={ratingValueReadout()}>{display}</span>
        </span>
      )}
      {name != null && <input type="hidden" name={name} value={val} />}
      <div
        ref={rowRef}
        className="vike-blocks-rating"
        role={interactive ? 'slider' : 'img'}
        tabIndex={interactive ? 0 : undefined}
        aria-label={label ?? name ?? 'Rating'}
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? max : undefined}
        aria-valuenow={interactive ? val : undefined}
        aria-valuetext={`${val} out of ${max}`}
        aria-disabled={disabled || undefined}
        style={ratingRowStyle(interactive)}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        {stars}
      </div>
    </div>
  )
}

registerBlockRenderer('rating', RatingView)
