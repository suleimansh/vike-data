// The shared descriptor trees. These are plain vike-blocks `definePage([...])` compositions — the
// SAME authoring API the examples/vike-blocks gallery pages use (card/tabs/dialog/alert/input from
// pages/card, pages/tabs, pages/dialog, pages/alert, pages/input; the docs shell from pages/doc-nav).
// There is nothing Mantine here: it's just blocks. What draws them is decided entirely by which
// renderers are registered (mantine-blocks.jsx registers Mantine), which is the whole thesis.
import { definePage, defineBlock, heading, text, badge, button, card, tabs, alert, dialog, input, layout, docNav, link, list } from 'vike-blocks'

// An example-local block: an invisible scroll target (renderer in mantine-blocks.jsx). Placed before
// a heading so the sidebar TOC's #anchors scroll to it. `anchor('setup')` -> { block:'anchor', id }.
const anchor = defineBlock('anchor', { build: (id) => ({ id }) })

// An account-settings panel that exercises every swapped content token: card (container) + tabs
// (container, nested blocks) + alert + input + dialog + button, plus built-in primitives
// (heading/text/badge) that fall through to their built-in renderers.
export const contentPage = definePage({
  sections: [
    heading('Account settings').level(1),
    text('One block descriptor tree, drawn by Mantine. Every control below is an ordinary vike-blocks descriptor — the exact same tree the vike-blocks gallery renders as shadcn-style built-ins.').tone('muted'),

    alert('Mantine is drawing this page')
      .intent('info')
      .body('button, card, tabs, alert, dialog and input are each a vike-blocks block type with a Mantine component registered against it. Swap the renderer, keep the descriptors.'),

    card([
      text('Update your profile. The two fields below are vike-blocks `input` descriptors drawn as Mantine inputs.'),
      input().type('text').value('Ada Lovelace').name('name'),
      input().type('email').placeholder('you@example.com').name('email'),

      tabs()
        .tab('general', 'General', [
          text('General settings live in this panel. Switching tabs is Mantine Tabs; the panel content is more blocks.'),
          badge('Pro plan').tone('info'),
        ])
        .tab('security', 'Security', [
          text('Change your password.'),
          input().type('password').value('hunter2').name('password'),
        ])
        .tab('danger', 'Danger zone', [
          alert('Careful').intent('warning').body('These actions are irreversible.'),
        ])
        .defaultValue('general'),
    ])
      .title('Profile')
      .description('Manage your account details.')
      .footer([
        dialog()
          .title('Delete account')
          .description('This cannot be undone.')
          .trigger('Delete account')
          .sections([text('All of your data will be permanently removed. A confirm button that actually deletes is the actions axis — here the footer buttons are just composition.')])
          .footer([button('Cancel').variant('ghost'), button('Delete').variant('danger')]),
        button('Save changes').variant('primary'),
      ]),
  ],
})

// A single-page documentation TOC — every sidebar link is an on-page #anchor (a real, working scroll
// target: `anchor(id)` sits before each heading), so the whole nav is clickable without a multi-page
// doc site. `.current('#setup')` highlights the active item and splices its sub-sections beneath it.
const tree = () =>
  docNav()
    .current('#setup')
    .group('Getting started', [
      ['Introduction', '#introduction'],
      ['Installation', '#installation'],
      ['Setup', '#setup', [['Requirements', '#requirements'], ['Config file', '#config']]],
    ])
    .group('Guides', [
      ['Routing', '#routing'],
      ['Data fetching', '#data'],
      ['Deployment', '#deploy'],
    ])
    .group('API', [['CLI', '#cli'], ['Configuration', '#api-config']])

// One article section: an invisible anchor target + heading + body. Reused so every TOC link scrolls.
const section = (id, title, level, ...body) => [anchor(id), heading(title).level(level), ...body]

export const docsPage = definePage({
  sections: [
    layout('docs')
      .slot('header', [link('◈ Acme Docs').to('/docs'), link('Gallery').to('/'), link('GitHub ↗').to('https://github.com/suleimansh/vike-data')])
      .slot('sidebar', [tree()])
      .slot('article', [
        ...section('introduction', 'Introduction', 1,
          text('This whole shell — the sticky navbar and the two-column [sidebar | article] frame — is the vike-blocks `docs` layout, drawn by a Mantine renderer. The sidebar tree and these headings are built-in blocks; the notice and button below are Mantine. Every link in the sidebar scrolls to a section here.'),
          alert('Same block IR').intent('success').body('The built-in DocsShell and this Mantine shell render the identical layout("docs") descriptor. That is the swappable-renderer thesis, in shell form.'),
        ),
        ...section('installation', 'Installation', 2,
          text('Install the packages, then import <Page> and the block builders. There is no Mantine in the descriptor tree — only which renderers are registered decides how it draws.'),
        ),
        ...section('setup', 'Setup', 1,
          text('Configure your project before the first run. This is the active TOC item, so its sub-sections (Requirements, Config file) splice in beneath it in the sidebar.'),
        ),
        ...section('requirements', 'Requirements', 2,
          list(['Node.js 20+', 'A package manager (pnpm / npm / yarn)', 'A terminal']),
        ),
        ...section('config', 'Config file', 2,
          text('Add a config file at the project root, then run the dev server. Scroll the article — the navbar and sidebar stick while the body scrolls under them.'),
        ),
        ...section('routing', 'Routing', 1,
          text('File-based routing lives under pages/. Each route is a folder with a +Page component.'),
        ),
        ...section('data', 'Data fetching', 2,
          text('Load data in +data and read it in the page. Server-side by default, streamed to the client.'),
        ),
        ...section('deploy', 'Deployment', 2,
          text('Build once, deploy the server bundle anywhere Node runs — or prerender to static files.'),
        ),
        ...section('cli', 'CLI', 1,
          text('The CLI scaffolds pages, runs the dev server, and builds for production.'),
        ),
        ...section('api-config', 'Configuration', 2,
          text('Every config key is typed. Extensions contribute their own keys through the same cumulative config point.'),
          button('Back to the gallery').variant('primary').to('/'),
        ),
      ]),
  ],
})
