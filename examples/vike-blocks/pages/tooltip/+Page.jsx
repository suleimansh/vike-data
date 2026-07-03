// The tooltip block demo. Each control below is the `tooltip` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native tip revealed on hover / focus, harvested from
// shadcn's Radix tooltip but reimplemented PURE-CSS — no portal, no JS, no state. Hover (or tab to) a
// trigger to reveal its tip; `.side()` places it; `.on(block)` wraps the annotated element.
import { definePage, resolvePage, tooltip, button, badge, link } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
  </div>
)

export default function TooltipPage() {
  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Tooltip block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A small label revealed on hover or keyboard focus. <code>tooltip('Save your changes').on(button('Save'))</code> — pure
        CSS (no portal, no JS, no state), so it works with no client JS and renders as-is on the server. Colors read
        vike-themes CSS vars. Tab through the triggers to see it reveal on focus too.
      </p>

      <Row label="On a button (default side: top)">
        {Show([tooltip('Save your changes').on(button('Save'))])}
        {Show([tooltip('Discard this draft').on(button('Cancel').variant('ghost'))])}
      </Row>

      <Row label="Placement — top / bottom / left / right">
        {Show([tooltip('Above').side('top').on(button('Top').variant('outline'))])}
        {Show([tooltip('Below').side('bottom').on(button('Bottom').variant('outline'))])}
        {Show([tooltip('To the left').side('left').on(button('Left').variant('outline'))])}
        {Show([tooltip('To the right').side('right').on(button('Right').variant('outline'))])}
      </Row>

      <Row label="Wrapping other blocks (badge, link)">
        {Show([tooltip('In beta — expect changes').on(badge('Beta').tone('info'))])}
        {Show([tooltip('Opens the documentation').side('bottom').on(link('Docs').to('/docs'))])}
      </Row>

      <Row label="Default '?' marker (no wrapped block)">
        {Show([tooltip('We never share your email address.')])}
      </Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
