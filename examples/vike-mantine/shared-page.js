// The shared content tree for the gallery (/). A plain vike-blocks `definePage([...])` composition —
// the SAME authoring API the examples/vike-blocks gallery pages use (card/tabs/dialog/alert/input from
// pages/card, pages/tabs, pages/dialog, pages/alert, pages/input). There is nothing Mantine here: it's
// just blocks. What draws them is decided entirely by which renderers are registered (mantine-blocks.jsx
// registers Mantine), which is the whole thesis. The docs site lives in docs-content.js.
import { definePage, heading, text, badge, button, card, tabs, alert, dialog, input } from 'vike-blocks'

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
