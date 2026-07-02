// The dropdown block demo. Each menu below is the `dropdown` block rendered through the registry
// (resolvePage + <Blocks>). A trigger opens a floating menu anchored below it: click an item (a link
// when `.item(label, { to })` is set, else a button) to run it and close; arrow-keys move between
// items, outside-click or Escape closes. Item behaviour that mutates is the actions axis (#385). The
// popover machinery (anchor + outside-click + Escape) is the dep-free `usePopover` primitive shared
// with the date-picker (and next the nav-menu).
import { definePage, resolvePage, dropdown } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function DropdownPage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Dropdown-menu block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A trigger that opens a floating menu anchored below it. <code>dropdown('Options').heading(...).item(label, {'{'} to {'}'}).separator().item(...)</code> —
        click an item to close, arrow-keys move between items, outside-click or Escape closes. Colors read vike-themes CSS vars. Mutating behaviour is the actions axis (#385).
      </p>

      <Label>A menu of links with a heading and a separator</Label>
      <Row>
        {Show([
          dropdown('Account')
            .heading('Signed in as jane')
            .item('Profile', { to: '/profile' })
            .item('Settings', { to: '/settings' })
            .separator()
            .item('Sign out'),
        ])}
      </Row>

      <Label>A disabled item + end-aligned</Label>
      <Row>
        {Show([
          dropdown('Actions')
            .item('Rename')
            .item('Duplicate')
            .separator()
            .item('Delete', { disabled: true })
            .align('end'),
        ])}
      </Row>

      <Label>Opens upward (side: top)</Label>
      <Row>{Show([dropdown('Open up').item('One').item('Two').item('Three').side('top')])}</Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
