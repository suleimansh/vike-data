// The item block demo. Each row is the `item` block rendered through the registry (resolvePage +
// <Blocks>): a reusable list row with an optional leading media, a title + description, and a trailing
// note. Here the items are composed inside a `card` to read as a settings list — items compose in any
// container. Theme-native — every color reads a vike-themes CSS var.
import { definePage, resolvePage, card, item } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />

export default function ItemPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Item block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A reusable list row: <code>item(title).description(...).media(...).trailing(...)</code>. A leading media chip, a title +
        muted description, and a trailing note. Items compose in any container — here they sit in a <code>card</code> as a settings list.
      </p>

      {Show([
        card([
          item('Billing').description('Manage your plan and invoices').media('💳').trailing('Pro'),
          item('Team members').description('Invite and manage access').media('👥').trailing('12'),
          item('Notifications').description('Email and push preferences').media('🔔'),
          item('Sign out').media('↩'),
        ]).title('Settings'),
      ])}

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
