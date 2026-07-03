// The pagination block demo. Each control below is the `pagination` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native page navigation harvested from shadcn's
// Pagination — nav > ul > li > a, the active page outlined + aria-current, chevron Prev/Next, ellipsis
// gaps. Each page is a real <a href> (built from the {page} template), so paging works with no client JS.
import { definePage, resolvePage, pagination } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.5rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{label}</div>
    {children}
  </div>
)

export default function PaginationPage() {
  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Pagination block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        Page navigation for a list or table. <code>pagination(6, 10).href('?page=&#123;page&#125;')</code> — the current page is
        outlined, gaps collapse to an ellipsis, and each page is a real <code>&lt;a href&gt;</code> so it works with no client JS.
        The example links carry <code>?page=</code> — click one and watch the active page follow the URL.
      </p>

      <Section label="Middle of a long list (page 6 of 10)">{Show([pagination(6, 10).href('?page={page}')])}</Section>

      <Section label="First page (Prev is disabled)">{Show([pagination(1, 10).href('?page={page}')])}</Section>

      <Section label="Last page (Next is disabled)">{Show([pagination(10, 10).href('?page={page}')])}</Section>

      <Section label="Wider window (2 siblings each side)">{Show([pagination(5, 10).href('?page={page}').siblings(2)])}</Section>

      <Section label="Few pages (no ellipsis)">{Show([pagination(2, 3).href('?page={page}')])}</Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
