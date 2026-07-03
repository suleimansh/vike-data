// The React renderer for the `bubble` block — a static, theme-native chat message bubble aligned to
// its sender. A plain-string body renders as text; a rich body is a resolved nested block composition
// drawn with <Blocks>. Alignment + colors come from the shared bubble-styles module, so this stays a
// thin binding and can't drift from the Vue twin.
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { bubbleRowStyle, bubbleStyle } from '../blocks/bubble-styles.js'

export function BubbleView({ from = 'assistant', text, sections }) {
  return (
    <div data-slot="bubble-row" style={bubbleRowStyle(from)}>
      <div data-slot="bubble" data-from={from} style={bubbleStyle(from)}>
        {sections ? <Blocks sections={sections} /> : text}
      </div>
    </div>
  )
}

registerBlockRenderer('bubble', BubbleView)
