// The React renderer for the `tooltip` block — a dep-free, theme-native tip revealed on hover / focus,
// PURELY WITH CSS (no portal, no JS, no state). The trigger is the wrapped block (drawn with <Blocks>)
// or a default focusable "?" marker; the tip is an absolutely-positioned sibling shown via the shared
// TOOLTIP_STYLE_TAG's `:hover` / `:focus-within` rules. SSR renders the final markup, so there's no
// hydration concern. Styles come from the shared tooltip-styles module, so this can't drift from the Vue twin.
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { tooltipWrapStyle, tooltipMarkerStyle, TOOLTIP_STYLE_TAG } from '../blocks/tooltip-styles.js'

export function TooltipView({ text = '', side = 'top', trigger = null }) {
  return (
    <span className="vike-blocks-tooltip" data-slot="tooltip" style={tooltipWrapStyle()}>
      <style>{TOOLTIP_STYLE_TAG}</style>
      {trigger ? (
        <Blocks sections={[trigger]} />
      ) : (
        <button type="button" aria-label={text} style={tooltipMarkerStyle()}>
          {'?'}
        </button>
      )}
      <span className="vike-blocks-tooltip-tip" data-slot="tooltip-content" data-side={side} role="tooltip">
        <span className="vike-blocks-tooltip-arrow" aria-hidden="true" />
        {text}
      </span>
    </span>
  )
}

registerBlockRenderer('tooltip', TooltipView)
