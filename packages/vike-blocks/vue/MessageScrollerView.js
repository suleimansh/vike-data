// The Vue renderer for the `message-scroller` block — the Vue twin of react/MessageScrollerView.jsx,
// a dep-free, theme-native scroll container for chat messages. A stateful component (setup + ref) that
// sticks to the bottom on mount and shows a floating jump-to-latest button while scrolled up. The
// messages are resolved nested blocks drawn with <Blocks>. Layout is shared with the React renderer
// via message-scroller-styles, so they can't drift.
import { h, ref, onMounted } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { scrollerWrapStyle, scrollerViewportStyle, jumpButtonStyle, AT_BOTTOM_THRESHOLD } from '../message-scroller-styles.js'

export const MessageScrollerView = {
  props: ['messages', 'maxHeight'],
  setup(props) {
    const viewport = ref(null)
    const atBottom = ref(true)

    onMounted(() => {
      const el = viewport.value
      if (el) el.scrollTop = el.scrollHeight // auto-scroll to the latest on mount
    })

    const onScroll = () => {
      const el = viewport.value
      if (!el) return
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight
      atBottom.value = distance <= AT_BOTTOM_THRESHOLD
    }

    const jump = () => {
      const el = viewport.value
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }

    return () =>
      h('div', { 'data-slot': 'message-scroller', style: scrollerWrapStyle }, [
        h(
          'div',
          { ref: viewport, onScroll, 'data-slot': 'message-scroller-viewport', style: scrollerViewportStyle(props.maxHeight ?? '24rem') },
          [h(Blocks, { sections: props.messages ?? [] })],
        ),
        atBottom.value ? null : h('button', { type: 'button', onClick: jump, 'aria-label': 'Jump to latest', style: jumpButtonStyle }, '↓'),
      ])
  },
}

registerBlockRenderer('message-scroller', MessageScrollerView)
