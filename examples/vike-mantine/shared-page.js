// The shared descriptor trees. These are plain vike-blocks `definePage([...])` compositions — the
// SAME authoring API the examples/vike-blocks gallery pages use (card/tabs/dialog/alert/input from
// pages/card, pages/tabs, pages/dialog, pages/alert, pages/input; the docs shell from pages/doc-nav).
// There is nothing Mantine here: it's just blocks. What draws them is decided entirely by which
// renderers are registered (mantine-blocks.jsx registers Mantine), which is the whole thesis.
import { definePage, heading, text, badge, button, card, tabs, alert, dialog, input, layout, docNav, link, list } from 'vike-blocks'

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

// One shared documentation tree, current page = /guide/setup — copied from the vike-blocks doc-nav
// gallery page. Rendered here, `layout('docs')` resolves through the built-in LayoutView to the
// Mantine `docs` shell we registered, and the article's `alert`/`button` draw as Mantine while the
// sidebar `docNav` and the headings/text fall through to their built-in renderers.
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

export const docsPage = definePage({
  sections: [
    layout('docs')
      .slot('header', [link('◈ Acme Docs').to('/docs'), link('Gallery').to('/'), link('GitHub ↗').to('https://github.com/suleimansh/vike-data')])
      .slot('sidebar', [tree()])
      .slot('article', [
        heading('Setup').level(1),
        text('This whole shell — the sticky navbar and the two-column [sidebar | article] frame — is the vike-blocks `docs` layout, drawn by a Mantine renderer. The sidebar tree and these headings are built-in blocks; the notice and button below are Mantine.'),
        alert('Same block IR').intent('success').body('The built-in DocsShell and this Mantine shell render the identical layout("docs") descriptor. That is the swappable-renderer thesis, in shell form.'),
        heading('Requirements').level(2),
        list(['Node.js 20+', 'A package manager (pnpm / npm / yarn)', 'A terminal']),
        heading('Config file').level(2),
        text('Add a config file at the project root, then run the dev server. Scroll the frame — the navbar and sidebar stick while the article scrolls under them.'),
        button('Get started').variant('primary').to('/'),
      ]),
  ],
})
