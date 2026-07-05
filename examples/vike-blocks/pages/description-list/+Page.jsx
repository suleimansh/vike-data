// The description-list block demo. Each list below is the `description-list` block rendered through the
// registry (resolvePage + <Blocks>): a key-value metadata grid. A value is a plain string or nested
// blocks (the Status rows compose a badge to show a value can hold any blocks). columns / bordered /
// span / title. Static + theme-native, so it renders fully on the server. The record-detail surface.
import { definePage, resolvePage, descriptionList, badge, link } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 2rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function DescriptionListPage() {
  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Description-list block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A key-value / metadata grid (Ant Descriptions) — the record-detail, summary, and metadata surface.{' '}
        <code>descriptionList().item(term, value, {'{ span }'}).columns(n).bordered().title(t)</code>. A value
        is a plain string or nested blocks, so it can be a status badge or a link. Responsive (collapses to
        one column on narrow screens), static, theme-native.
      </p>

      <Section label="Plain, two columns; a value composes a badge and a link">
        {Show([
          descriptionList()
            .title('Order #1024')
            .item('Status', [badge('Paid').tone('success')])
            .item('Customer', 'Ada Lovelace')
            .item('Placed', 'Mar 3, 2026')
            .item('Total', '$248.00')
            .item('Invoice', [link('Download PDF').to('/invoices/1024')])
            .item('Shipping address', '12 Analytical Way, London EC1', { span: 2 })
            .columns(2),
        ])}
      </Section>

      <Section label="Bordered, three columns (the table-like variant)">
        {Show([
          descriptionList()
            .item('Plan', 'Pro')
            .item('Seats', '12')
            .item('Renews', 'Aug 1, 2026')
            .item('Status', [badge('Active').tone('success')])
            .item('Billing', 'Annual')
            .item('Owner', 'ada@example.com')
            .columns(3)
            .bordered(),
        ])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
