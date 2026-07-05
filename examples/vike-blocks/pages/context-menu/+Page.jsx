// The context-menu block demo. Each region below is wrapped by the `context-menu` block: right-click it
// and a menu opens at the cursor (portalled to <body>, flipping at the viewport edge). Items reuse the
// dropdown model (link when `to` is set, else a button; separators + headings). It is non-modal (no
// backdrop, no scroll-lock) and closes on outside-click / Escape / scroll. Dep-free, theme-native.
import { definePage, resolvePage, contextMenu, card, text } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem', maxWidth: 420 }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function ContextMenuPage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Context-menu block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A right-click menu anchored at the cursor — the last of the menu family (dropdown / nav-menu /
        command). <code>contextMenu().item(label, {'{ to, disabled }'}).separator().heading(text).on(block)</code>.{' '}
        <code>.on()</code> wraps the right-click region; omit it for a default affordance box. Non-modal,
        flips at the viewport edge, closes on outside-click / Escape / scroll. <b>Right-click the regions
        below.</b>
      </p>

      <Section label="Right-click a card">
        {Show([
          contextMenu()
            .heading('report.pdf')
            .item('Open', { to: '/files/report' })
            .item('Download', { to: '/files/report?dl=1' })
            .separator()
            .item('Rename')
            .item('Delete', { disabled: true })
            .on(card([text('📄 report.pdf'), text('Right-click for actions').tone('muted')]).title('Document')),
        ])}
      </Section>

      <Section label="Default affordance (no .on())">
        {Show([
          contextMenu()
            .item('Cut')
            .item('Copy')
            .item('Paste')
            .separator()
            .item('Select all'),
        ])}
      </Section>

      <Section label="Right-click near the bottom / right edge — the menu flips to stay on-screen">
        {Show([
          contextMenu()
            .item('First')
            .item('Second')
            .item('Third')
            .on(card([text('Try right-clicking at different spots')])),
        ])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
