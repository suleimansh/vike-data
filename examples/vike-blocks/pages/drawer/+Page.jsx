// The drawer block demo. Each button opens a `drawer` block rendered through the registry (resolvePage
// + <Blocks>). An edge-anchored sliding panel with a grabber handle: press the handle and drag toward
// the anchored edge to flick it closed (past the threshold it dismisses, short of it snaps back). It
// shares the dialog/sheet overlay machinery (portal, focus trap, Escape, backdrop-click, scroll-lock).
// Open/close + drag are local UI state; the body composes any blocks.
import { definePage, resolvePage, drawer, item, text } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function DrawerPage() {
  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Drawer block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        An edge-anchored sliding panel with a drag-to-dismiss handle. <code>drawer().trigger(...).side('bottom'|'top'|'left'|'right').sections([...])</code>{' '}
        — press the grabber and drag toward the edge to flick it closed. It shares the dialog/sheet overlay machinery and defaults to the
        bottom edge. Colors read vike-themes CSS vars.
      </p>

      <Label>The default: a bottom drawer of actions (drag the handle down to dismiss)</Label>
      <Row>
        {Show([
          drawer()
            .trigger('Quick actions')
            .side('bottom')
            .title('Quick actions')
            .description('Drag the handle down, or tap outside, to close.')
            .sections([item('Share').media('↗'), item('Rename').media('✎'), item('Delete').media('🗑')]),
        ])}
      </Row>

      <Label>Anchor to another edge</Label>
      <Row>
        {Show([drawer().trigger('Top').side('top').title('Top drawer').sections([text('Drag up to dismiss.')])])}
        {Show([drawer().trigger('Left').side('left').title('Left drawer').sections([text('Drag left to dismiss.')])])}
        {Show([drawer().trigger('Right').side('right').title('Right drawer').sections([text('Drag right to dismiss.')])])}
      </Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
