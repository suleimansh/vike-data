// The timeline block demo. Each timeline below is the `timeline` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native vertical activity feed: a rail of
// tone-colored dots joined by connectors, each event a title + optional time + a string or
// nested-block body (the last event composes a badge to show a body can hold any blocks).
import { definePage, resolvePage, timeline, badge, text } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem', maxWidth: 460 }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function TimelinePage() {
  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Timeline block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A vertical activity feed / history — the audit-log, order-status, changelog surface.{' '}
        <code>timeline().item(title, {'{ time, tone, filled, body }'})</code>. Per-item <code>tone</code> colors the
        dot; <code>filled: false</code> draws a hollow ring for an upcoming step; a <code>body</code> is a string or
        nested blocks. Dep-free, theme-native.
      </p>

      <Section label="Order status">
        {Show([
          timeline()
            .item('Order placed', { time: '09:41', tone: 'success' })
            .item('Payment confirmed', { time: '09:42', tone: 'success' })
            .item('Shipped', { time: 'Mar 3', body: 'Carrier: UPS · Tracking 1Z999' })
            .item('Out for delivery', { time: 'Mar 5', tone: 'muted', filled: false, body: 'Estimated by 5pm' }),
        ])}
      </Section>

      <Section label="A body composes other blocks">
        {Show([
          timeline()
            .item('Deploy started', { time: '12:00', tone: 'default' })
            .item('Build passed', { time: '12:03', tone: 'success', body: [badge('v2.4.1').tone('success')] })
            .item('Rollout paused', { time: '12:05', tone: 'warning', body: [text('Canary error rate above threshold.')] }),
        ])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
