// The nav-menu block demo. The bar below is the `nav-menu` block rendered through the registry
// (resolvePage + <Blocks>). Top-level links navigate; a group trigger opens a dropdown of links
// anchored below it (one section open at a time). Arrow-keys move between a group's links, outside-click
// or Escape closes. The popover machinery + roving arrow-key nav are the same dep-free primitives the
// dropdown-menu uses. Navigation is a real <a>; mutating behaviour is the actions axis (#385).
import { definePage, resolvePage, navMenu } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function NavMenuPage() {
  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Navigation-menu block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A horizontal bar of links and dropdown sections. <code>navMenu().link(label, to).group(label, [links]).link(...)</code> — a group opens a
        menu of links (each a title + optional description) anchored below its trigger; one section is open at a time. Arrow-keys move between a
        group's links, outside-click or Escape closes. Colors read vike-themes CSS vars.
      </p>

      <Label>Links + two dropdown sections</Label>
      <Row>
        {Show([
          navMenu()
            .link('Home', '/')
            .group('Products', [
              { label: 'Analytics', to: '/products/analytics', description: 'Dashboards and funnels' },
              { label: 'Billing', to: '/products/billing', description: 'Plans, usage, and invoices' },
              { label: 'Automations', to: '/products/automations', description: 'Rules that run themselves' },
            ])
            .group('Resources', [
              ['Docs', '/docs', 'Guides and API reference'],
              ['Blog', '/blog', 'Product news and deep-dives'],
              ['Changelog', '/changelog'],
            ])
            .link('Pricing', '/pricing'),
        ])}
      </Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
