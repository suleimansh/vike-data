// The breadcrumb block demo. Each control below is the `breadcrumb` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native page trail — nav > ol of crumbs, the last one
// the current page (aria-current), separated by a chevron. Plain links, so it works with no client JS.
import { definePage, resolvePage, breadcrumb } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function BreadcrumbPage() {
  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Breadcrumb block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        The trail of pages to the current one. <code>breadcrumb().crumb('Home', '/').crumb('Posts', '/posts').crumb('Edit')</code>
        — every crumb with a <code>to</code> is a link, and the last crumb is the current page (foreground, aria-current). Plain
        links, so it works with no client JS.
      </p>

      <Section label="A page trail (last crumb = current page)">
        {Show([breadcrumb().crumb('Home', '/').crumb('Posts', '/posts').crumb('Edit post')])}
      </Section>

      <Section label="An admin trail">
        {Show([breadcrumb().crumb('Admin', '/admin').crumb('Users', '/admin/users').crumb('Ada Lovelace')])}
      </Section>

      <Section label="Custom separator">
        {Show([breadcrumb().crumb('Docs', '/docs').crumb('Blocks', '/docs/blocks').crumb('Breadcrumb').separator('/')])}
      </Section>

      <Section label="Two levels">
        {Show([breadcrumb().crumb('Home', '/').crumb('Settings')])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
