// A small real docs site, expressed as data. Each page is a route under /docs with its own article
// sections; the sidebar links to the real routes, highlights the active page, and splices that page's
// on-page anchors beneath it. Everything here is plain vike-blocks — `buildDocPage(path)` returns a
// `layout('docs')` tree that the Mantine `docs` shell (registered in mantine-blocks.jsx) draws. Add a
// page by adding an entry to DOC_PAGES; the nav, routing (via pages/docs/@slug), and prev/next follow.
import { definePage, defineBlock, layout, docNav, heading, text, list, alert, link, button, badge, divider } from 'vike-blocks'

// The invisible scroll target (renderer in mantine-blocks.jsx) that makes the on-page #anchors land
// below the sticky navbar.
const anchor = defineBlock('anchor', { build: (id) => ({ id }) })

// Ordered pages. `sections` drive both the article body and the sidebar's on-page sub-links (level 2+).
export const DOC_PAGES = [
  {
    path: '/docs', group: 'Getting started', title: 'Introduction',
    sections: [
      { id: 'overview', title: 'Introduction', level: 1, body: [
        text('Welcome to Acme — a small, real documentation site built entirely from vike-blocks descriptors and drawn by Mantine. The sticky navbar, the two-column [sidebar | article] frame, and this prose are one `layout("docs")` block; the sidebar tree is a `docNav` block; the notices and buttons are Mantine.'),
        alert('Same block IR').intent('success').body('The built-in DocsShell and this Mantine shell render the identical layout("docs") descriptor. Swap the renderer, keep the block — that is the whole thesis, in shell form.'),
      ] },
      { id: 'why', title: 'Why a block IR', level: 2, body: [
        text('A page is a tree of typed descriptors, not JSX. Because the descriptors are just data, the component that draws each one is swappable: the same tree renders as shadcn-style built-ins in examples/vike-blocks and as Mantine here.'),
        list(['One authoring API for every renderer', 'Swap a component kit without touching a page', 'Third-party renderers are peers of the built-ins']),
      ] },
    ],
  },
  {
    path: '/docs/installation', group: 'Getting started', title: 'Installation',
    sections: [
      { id: 'install', title: 'Installation', level: 1, body: [
        text('Install the packages, then import <Page> and the block builders. There is no Mantine in the descriptor tree — only which renderers are registered decides how it draws.'),
      ] },
      { id: 'package-manager', title: 'Package manager', level: 2, body: [
        text('pnpm, npm, and yarn all work. This monorepo uses pnpm workspaces.'),
        badge('pnpm recommended').tone('info'),
      ] },
      { id: 'typescript', title: 'TypeScript', level: 2, body: [
        text('Everything is typed, including the block builders and the config keys. No extra setup — the types come with the packages.'),
      ] },
    ],
  },
  {
    path: '/docs/setup', group: 'Getting started', title: 'Setup',
    sections: [
      { id: 'setup', title: 'Setup', level: 1, body: [
        text('Configure your project before the first run. This page is the active nav item, so its sub-sections splice in beneath it in the sidebar.'),
      ] },
      { id: 'requirements', title: 'Requirements', level: 2, body: [
        list(['Node.js 20+', 'A package manager (pnpm / npm / yarn)', 'A terminal']),
      ] },
      { id: 'config-file', title: 'Config file', level: 2, body: [
        text('Add a config file at the project root, then run the dev server. Scroll the article — the navbar and sidebar stick while the body scrolls under them.'),
      ] },
    ],
  },
  {
    path: '/docs/routing', group: 'Guides', title: 'Routing',
    sections: [
      { id: 'routing', title: 'Routing', level: 1, body: [
        text('File-based routing lives under pages/. Each route is a folder with a +Page component; this docs site itself uses one dynamic route (pages/docs/@slug) for every page you are reading.'),
      ] },
      { id: 'dynamic', title: 'Dynamic routes', level: 2, body: [
        text('A @param segment captures a value. The current path drives which doc page renders and which sidebar item is active.'),
      ] },
    ],
  },
  {
    path: '/docs/data-fetching', group: 'Guides', title: 'Data fetching',
    sections: [
      { id: 'data', title: 'Data fetching', level: 1, body: [
        text('Load data in +data and read it in the page. Server-side by default, streamed to the client on hydration.'),
      ] },
      { id: 'client-server', title: 'Client vs server', level: 2, body: [
        text('Server data is fetched once during SSR; client interactions (like the tabs and modal on the gallery page) hydrate on top.'),
      ] },
    ],
  },
  {
    path: '/docs/deployment', group: 'Guides', title: 'Deployment',
    sections: [
      { id: 'deploy', title: 'Deployment', level: 1, body: [
        text('Build once, deploy the server bundle anywhere Node runs — or prerender to static files.'),
      ] },
      { id: 'static', title: 'Static prerender', level: 2, body: [
        text('For a docs site like this one, prerender every route to HTML and serve it from any CDN.'),
      ] },
    ],
  },
  {
    path: '/docs/cli', group: 'API', title: 'CLI',
    sections: [
      { id: 'cli', title: 'CLI', level: 1, body: [
        text('The CLI scaffolds pages, runs the dev server, and builds for production.'),
      ] },
      { id: 'commands', title: 'Commands', level: 2, body: [
        list(['dev — start the dev server', 'build — build for production', 'preview — serve the production build']),
      ] },
    ],
  },
  {
    path: '/docs/configuration', group: 'API', title: 'Configuration',
    sections: [
      { id: 'configuration', title: 'Configuration', level: 1, body: [
        text('Every config key is typed. Extensions contribute their own keys through the same cumulative config point.'),
      ] },
      { id: 'extensions', title: 'Extensions', level: 2, body: [
        text('An extension can register block renderers, layout shells, and config keys — exactly how this example registers Mantine.'),
      ] },
    ],
  },
]

// Build the sidebar nav from the page registry: one group per `group`, each page a link to its route,
// with its level-2+ sections as on-page sub-links (the shell shows them under the active page).
function docsNav(currentPath) {
  const nav = docNav().current(currentPath)
  const groups = []
  for (const p of DOC_PAGES) if (!groups.includes(p.group)) groups.push(p.group)
  for (const g of groups) {
    const links = DOC_PAGES.filter((p) => p.group === g).map((p) => {
      const subs = p.sections.filter((s) => s.level >= 2).map((s) => [s.title, `${p.path}#${s.id}`])
      return subs.length ? [p.title, p.path, subs] : [p.title, p.path]
    })
    nav.group(g, links)
  }
  return nav
}

// The article body: each section is an anchor target + heading + its body blocks, then prev/next.
function docsArticle(page, index) {
  const blocks = []
  for (const s of page.sections) blocks.push(anchor(s.id), heading(s.title).level(s.level), ...s.body)
  const prev = DOC_PAGES[index - 1]
  const next = DOC_PAGES[index + 1]
  blocks.push(divider())
  if (prev) blocks.push(button(`← ${prev.title}`).variant('outline').to(prev.path))
  if (next) blocks.push(button(`${next.title} →`).variant('primary').to(next.path))
  return blocks
}

// The full page for a route. Falls back to the first page for an unknown path.
export function buildDocPage(currentPath) {
  const index = Math.max(0, DOC_PAGES.findIndex((p) => p.path === currentPath))
  const page = DOC_PAGES[index]
  return definePage({
    sections: [
      layout('docs')
        .slot('header', [link('◈ Acme Docs').to('/docs'), link('Gallery').to('/'), link('GitHub ↗').to('https://github.com/suleimansh/vike-data')])
        .slot('sidebar', [docsNav(currentPath)])
        .slot('article', docsArticle(page, index)),
    ],
  })
}
