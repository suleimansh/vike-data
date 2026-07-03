// The avatar block demo. Each control below is the `avatar` / `avatarGroup` block rendered through the
// registry (resolvePage + <Blocks>). It is a dep-free, theme-native user image with an initials fallback
// (the image hides itself on a load error, revealing the initials), an optional status dot, and an
// overlapping group with a "+N" count. Harvested from shadcn's Radix avatar.
import { definePage, resolvePage, avatar, avatarGroup } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
  </div>
)

export default function AvatarPage() {
  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Avatar block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A user image with an initials fallback — <code>avatar().src('/me.png').name('Ada Lovelace')</code>. When there's no image
        (or it fails to load) the derived initials show, then a user icon. Colors read vike-themes CSS vars. The image URLs
        below are intentionally broken, so you see the fallback.
      </p>

      <Row label="Initials fallback (no image)">
        {Show([avatar().name('Ada Lovelace')])}
        {Show([avatar().name('Grace Hopper')])}
        {Show([avatar().name('Cher')])}
        {Show([avatar()])}
      </Row>

      <Row label="Sizes + square shape">
        {Show([avatar().name('Ada Lovelace').size(28)])}
        {Show([avatar().name('Ada Lovelace').size(40)])}
        {Show([avatar().name('Ada Lovelace').size(56)])}
        {Show([avatar().name('Ada Lovelace').size(40).shape('square')])}
      </Row>

      <Row label="Status dot">
        {Show([avatar().name('Ada Lovelace').status('online')])}
        {Show([avatar().name('Grace Hopper').status('busy')])}
        {Show([avatar().name('Katherine Johnson').status('away')])}
        {Show([avatar().name('Linus Torvalds').status('offline')])}
      </Row>

      <Row label="Broken image falls back to initials">{Show([avatar().src('/does-not-exist.png').name('Ada Lovelace')])}</Row>

      <Row label="Group with a +N overflow (max 3)">
        {Show([avatarGroup([avatar().name('Ada Lovelace'), avatar().name('Grace Hopper'), avatar().name('Katherine Johnson'), avatar().name('Linus Torvalds'), avatar().name('Margaret Hamilton')]).max(3)])}
      </Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
