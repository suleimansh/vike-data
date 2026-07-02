// The sheet block demo. Each button below opens a `sheet` block rendered through the registry
// (resolvePage + <Blocks>). A side panel overlay anchored to a screen edge, sliding in from it, built
// on the SAME shared overlay primitive as dialog (portal, focus trap, Escape, backdrop-click,
// scroll-lock). Open/close is local UI state; the body composes any blocks. The real submit of a form
// inside a sheet is the actions axis (#385).
import { definePage, resolvePage, sheet, field, input, text, button } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function SheetPage() {
  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Sheet block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A side panel overlay anchored to a screen edge. <code>sheet().trigger(...).side('right'|'left'|'top'|'bottom').sections([...])</code> —
        it slides in from its edge and shares the dialog's overlay machinery (portal, focus trap, Escape, backdrop-click, scroll-lock). Colors
        read vike-themes CSS vars.
      </p>

      <Label>Anchor to each edge</Label>
      <Row>
        {Show([sheet().trigger('Right').side('right').title('Right sheet').description('The default edge.').sections([text('A sheet holds any blocks.')])])}
        {Show([sheet().trigger('Left').side('left').title('Left sheet').sections([text('Slides in from the left.')])])}
        {Show([sheet().trigger('Top').side('top').title('Top sheet').sections([text('Drops down from the top.')])])}
        {Show([sheet().trigger('Bottom').side('bottom').title('Bottom sheet').sections([text('Rises from the bottom.')])])}
      </Row>

      <Label>A filters sheet (composes a form)</Label>
      <Row>
        {Show([
          sheet()
            .trigger('Filters')
            .side('right')
            .title('Filters')
            .description('Narrow the results.')
            .sections([field('Status').control(input().placeholder('Any')), field('Owner').control(input().placeholder('Anyone')), button('Apply')]),
        ])}
      </Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
