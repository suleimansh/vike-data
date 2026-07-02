// The React renderer for the `message-scroller` block — a dep-free, theme-native scroll container for
// chat messages. On mount it sticks to the bottom (auto-scroll to the latest); a floating jump button
// appears while the user has scrolled up and returns them to the bottom. The messages are resolved
// nested blocks drawn with <Blocks>. Layout comes from the shared message-scroller-styles module, so
// this stays a thin binding and can't drift from the Vue twin.
import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { scrollerWrapStyle, scrollerViewportStyle, jumpButtonStyle, AT_BOTTOM_THRESHOLD } from '../message-scroller-styles.js'

// Stick to the bottom before paint on the client; a no-op (no warning) during SSR.
const useIsoLayout = typeof document !== 'undefined' ? useLayoutEffect : useEffect

export function MessageScrollerView({ messages = [], maxHeight = '24rem' }) {
  const ref = useRef(null)
  const [atBottom, setAtBottom] = useState(true)

  useIsoLayout(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight // auto-scroll to the latest on mount
  }, [])

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    setAtBottom(distance <= AT_BOTTOM_THRESHOLD)
  }

  const jump = () => {
    const el = ref.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  return (
    <div data-slot="message-scroller" style={scrollerWrapStyle}>
      <div ref={ref} onScroll={onScroll} data-slot="message-scroller-viewport" style={scrollerViewportStyle(maxHeight)}>
        <Blocks sections={messages} />
      </div>
      {!atBottom && (
        <button type="button" onClick={jump} aria-label="Jump to latest" style={jumpButtonStyle}>
          ↓
        </button>
      )}
    </div>
  )
}

registerBlockRenderer('message-scroller', MessageScrollerView)
