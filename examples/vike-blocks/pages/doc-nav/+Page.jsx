// The doc-nav block demo, plus the `docs` layout shell it was built for (#420 — DocPress's page
// shell expressed on the vike-blocks IR). The first panel is the sidebar tree on its own; the second
// composes it into a full `layout('docs')` (navbar row + [sidebar | article]) — the same shell
// DocPress's Layout maps onto, drawn here through the block registry.
import { definePage, resolvePage, docNav, layout, heading, text, link, list } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />

// One shared documentation tree, current page = /guide/setup (so its category opens, the page
// highlights, and its on-page sections splice in beneath it).
const tree = () =>
  docNav()
    .current('/guide/setup')
    .group('Getting started', [
      ['Introduction', '/guide/intro'],
      ['Installation', '/guide/install'],
      ['Setup', '/guide/setup', [['Requirements', '#requirements'], ['Config file', '#config']]],
    ])
    .group('Guides', [
      ['Routing', '/guide/routing'],
      ['Data fetching', '/guide/data'],
      ['Deployment', '/guide/deploy'],
    ])
    .group('API', [['CLI', '/api/cli'], ['Config', '/api/config']])

const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 2rem' }}>
    <div style={{ fontSize: 13, color: 'var(--color-muted, #64748b)', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function DocNavPage() {
  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <h1 style={{ marginTop: 0 }}>Doc-nav block &amp; docs shell</h1>
      <p style={{ color: 'var(--color-muted, #64748b)', lineHeight: 1.6 }}>
        A documentation sidebar tree — collapsible categories, page links, active + relevant state, and an on-page
        section splice under the active page. <code>docNav().current(path).group(label, links)</code>. Navigation is a
        real <code>&lt;a&gt;</code>, so it works with no client JS. The category holding the current page starts open;
        the rest start collapsed (seeded from resolve, so there is no hydration flash).
      </p>

      <Section label="The sidebar tree on its own">
        <div style={{ maxWidth: 260, border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 12, padding: '1.25rem 1rem', background: 'var(--color-surface, #fff)' }}>
          {Show([tree()])}
        </div>
      </Section>

      <Section label="Composed into a docs shell — layout('docs') (navbar + sidebar + article)">
        <p style={{ color: 'var(--color-muted, #64748b)', fontSize: 14, marginTop: 0 }}>
          The same tree in the <code>docs</code> layout variant. Scroll the frame — the navbar and sidebar stick. This
          is the shell a DocPress site maps onto; swap the renderer, keep the block IR.
        </p>
        <div style={{ height: 520, overflow: 'auto', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 12, resize: 'vertical' }}>
          {Show([
            layout('docs')
              .slot('header', [link('◈ Acme Docs').to('/'), link('Guides').to('/guide/intro'), link('GitHub ↗').to('https://github.com')])
              .slot('sidebar', [tree()])
              .slot('article', [
                heading('Setup').level(1),
                text('Configure your project before the first run. This article is the article region of the docs shell — an ordinary block composition (a real DocPress site feeds its MDX here instead).'),
                heading('Requirements').level(2),
                list(['Node.js 20+', 'A package manager (pnpm / npm / yarn)', 'A terminal']),
                heading('Config file').level(2),
                text('Add a config file at the project root, then run the dev server. Keep scrolling to see the sticky navbar and sidebar hold their place while the article scrolls under them.'),
                text('The sidebar highlights the current page and reveals its on-page sections; the category it belongs to is expanded, the others collapsed until you open them.'),
              ]),
          ])}
        </div>
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
