// The Vue renderer for the `rating` block — the Vue twin of react/RatingView.jsx. A dep-free,
// theme-native star rating over the shared rating-styles module. The star row is a focusable
// role="slider" (arrow keys adjust; Home/End jump); moving the pointer previews a rating and clicking
// commits it. It tracks its own value (binding is the actions axis #385), so `value` is the INITIAL
// rating and SSR agrees with the first client render. Each star is an outline with a colored fill layer
// clipped to its fraction, so half ratings show half-filled stars.
import { h, ref } from 'vue'
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

const starSvg = (color) => h('svg', { width: SIZE, height: SIZE, viewBox: '0 0 24 24', 'aria-hidden': 'true' }, [h('path', { d: STAR_PATH, fill: color })])

const star = (fill) =>
  h('span', { style: starCellStyle(SIZE) }, [
    starSvg(STAR_EMPTY_COLOR),
    h('span', { class: 'vike-blocks-rating-fill', style: starFillClipStyle(fill) }, [starSvg(STAR_FILL_COLOR)]),
  ])

export const RatingView = {
  props: ['label', 'value', 'max', 'allowHalf', 'readOnly', 'disabled', 'name'],
  setup(props) {
    const max = props.max ?? 5
    const allowHalf = !!props.allowHalf
    const interactive = !props.readOnly && !props.disabled
    const unit = allowHalf ? 0.5 : 1
    const val = ref(snapRating(props.value ?? 0, max, allowHalf))
    const hover = ref(null)
    const rowEl = ref(null)

    const onPointerMove = (e) => {
      if (!interactive) return
      hover.value = ratingValueAt(e.clientX, rowEl.value?.getBoundingClientRect(), max, allowHalf)
    }
    const onClick = (e) => {
      if (!interactive) return
      const v = ratingValueAt(e.clientX, rowEl.value?.getBoundingClientRect(), max, allowHalf)
      if (v != null) val.value = v
    }
    const onKeydown = (e) => {
      if (!interactive) return
      let next = val.value
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = val.value - unit
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = val.value + unit
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = max
      else return
      e.preventDefault()
      val.value = snapRating(next, max, allowHalf)
    }

    return () => {
      const display = hover.value ?? val.value
      const stars = Array.from({ length: max }, (_, i) => star(starFill(i, display)))

      return h('div', { 'data-slot': 'rating', style: ratingRootStyle(!!props.disabled) }, [
        h('style', RATING_STYLE_TAG),
        props.label != null
          ? h('span', { style: ratingLabelStyle() }, [h('span', props.label), h('span', { style: ratingValueReadout() }, display)])
          : null,
        props.name != null ? h('input', { type: 'hidden', name: props.name, value: val.value }) : null,
        h(
          'div',
          {
            ref: (el) => (rowEl.value = el),
            class: 'vike-blocks-rating',
            role: interactive ? 'slider' : 'img',
            tabindex: interactive ? 0 : undefined,
            'aria-label': props.label ?? props.name ?? 'Rating',
            'aria-valuemin': interactive ? 0 : undefined,
            'aria-valuemax': interactive ? max : undefined,
            'aria-valuenow': interactive ? val.value : undefined,
            'aria-valuetext': `${val.value} out of ${max}`,
            'aria-disabled': props.disabled || undefined,
            style: ratingRowStyle(interactive),
            onPointermove: onPointerMove,
            onPointerleave: () => (hover.value = null),
            onClick,
            onKeydown,
          },
          stars,
        ),
      ])
    }
  },
}

registerBlockRenderer('rating', RatingView)
