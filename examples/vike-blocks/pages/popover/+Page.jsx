// The popover block demo. Each popover below is the `popover` block rendered through the registry
// (resolvePage + <Blocks>). A trigger opens a floating panel of ARBITRARY nested content anchored to
// it — the general-purpose sibling of the dropdown menu (whose content is a fixed list of items).
// `popover(label).content([...blocks]).side().align()`, or `.trigger(block)` for a custom opener.
// Outside-click or Escape closes; the panel flips when it would run off a viewport edge. The anchoring
// is the dep-free `usePopover` primitive shared with the date-picker, dropdown and combobox.
import { definePage, resolvePage, popover, button, heading, text, checkbox, input, field, divider } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0 0 1.5rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: 'var(--color-muted)', margin: '0 0 0.5rem' }}>{children}</div>

export default function PopoverPage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <h1 style={{ marginTop: 0 }}>Popover block</h1>
      <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
        A trigger that opens a floating panel of arbitrary content anchored to it.{' '}
        <code>popover('Filters').content([...blocks]).side().align()</code> — outside-click or Escape closes, and the
        panel flips when it would overflow the viewport. The content is any composition of blocks, resolved recursively.
        Built on the same dep-free <code>usePopover</code> primitive as the date-picker and dropdown.
      </p>

      <Label>A default button trigger over rich content</Label>
      <Row>
        {Show([
          popover('About this project').content([
            heading('vike-blocks').level(4),
            text('Composable UI as data — a page is a list of block descriptors, drawn by a per-framework renderer.').tone('muted'),
            divider(),
            button('Read the docs').variant('outline').to('/'),
          ]),
        ])}
      </Row>

      <Label>A small form in a popover (filters)</Label>
      <Row>
        {Show([
          popover('Filters').content([
            field('Search').control(input().placeholder('Title contains...')),
            checkbox('Published only'),
            checkbox('Has a cover image'),
            button('Apply filters').variant('primary'),
          ]),
        ])}
      </Row>

      <Label>A custom trigger block (.trigger) + end-aligned</Label>
      <Row>
        {Show([
          popover()
            .trigger(button('Account').variant('secondary'))
            .align('end')
            .content([
              text('Signed in as jane@example.com').tone('muted'),
              divider(),
              button('Sign out').variant('outline'),
            ]),
        ])}
      </Row>

      <Label>Opens upward (side: top)</Label>
      <Row>
        {Show([
          popover('Open up').side('top').content([text('This panel grows upward out of its trigger.'), text('Handy for controls near the bottom of the page.').tone('muted')]),
        ])}
      </Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
