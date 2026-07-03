// The Vue renderer for the `tooltip` block — the Vue twin of react/TooltipView.jsx, a dep-free,
// theme-native tip revealed on hover / focus PURELY WITH CSS (no portal, no JS, no state). The trigger
// is the wrapped block (drawn with <Blocks>) or a default focusable "?" marker; the tip is an
// absolutely-positioned sibling shown via the shared TOOLTIP_STYLE_TAG. SSR renders the final markup.
// Shares the styles with the React renderer via tooltip-styles, so they can't drift.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { tooltipWrapStyle, tooltipMarkerStyle, TOOLTIP_STYLE_TAG } from '../blocks/tooltip-styles.js'

export const TooltipView = {
  props: ['text', 'side', 'trigger'],
  setup(props) {
    return () => {
      const text = props.text ?? ''
      const trigger = props.trigger
        ? h(Blocks, { sections: [props.trigger] })
        : h('button', { type: 'button', 'aria-label': text, style: tooltipMarkerStyle() }, '?')
      return h('span', { class: 'vike-blocks-tooltip', 'data-slot': 'tooltip', style: tooltipWrapStyle() }, [
        h('style', TOOLTIP_STYLE_TAG),
        trigger,
        h('span', { class: 'vike-blocks-tooltip-tip', 'data-slot': 'tooltip-content', 'data-side': props.side ?? 'top', role: 'tooltip' }, [
          h('span', { class: 'vike-blocks-tooltip-arrow', 'aria-hidden': 'true' }),
          text,
        ]),
      ])
    }
  },
}

registerBlockRenderer('tooltip', TooltipView)
