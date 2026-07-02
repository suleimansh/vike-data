// The React components for the built-in leaf blocks, registered against their block types.
// Each receives the block's resolved view-model as props (for a pass-through block that IS its
// descriptor props, e.g. text -> { value, tone }). No React import — vike-react uses the
// automatic JSX runtime, matching the rest of the family. Importing this module registers the
// built-ins as a side effect (Blocks.jsx imports it for exactly that).
import { registerBlockRenderer } from './registry.js'
import { badgeStyle } from '../badge-styles.js'
import { resolveTextStyle, listStyle, listItemStyle } from '../typography-styles.js'
import {
  parseMarkdown,
  mdRootStyle,
  mdParaStyle,
  mdLinkStyle,
  mdListStyle,
  mdQuoteStyle,
  mdInlineCodeStyle,
  mdCodeBlockStyle,
  mdHrStyle,
  mdHeadingStyle,
} from '../markdown-parse.js'

const TONE = { muted: 'var(--color-muted)', danger: 'var(--color-danger, #dc2626)', success: 'var(--color-success, #16a34a)', info: 'var(--color-primary, #2563eb)' }

// A run of text on the shadcn Base typography surface: `.variant()` picks lead / muted /
// blockquote / inline code (default is a plain span); a known `.tone()` tints the color.
export function Text({ value, variant, tone }) {
  const { tag: Tag, style } = resolveTextStyle(variant, tone)
  return <Tag style={style}>{value}</Tag>
}

// An ordered/unordered list of strings on the shadcn list surface.
export function List({ items = [], ordered }) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag style={listStyle(ordered)}>
      {items.map((item, i) => (
        <li key={i} style={listItemStyle}>{item}</li>
      ))}
    </Tag>
  )
}

// Top margin scales with level so sections breathe: a page-title h1 stays flush (usually the first
// block on a page), while an h2/h3 section heading separates from the block above it.
const HEADING_TOP = { 1: '0', 2: '1.5rem', 3: '1.25rem' }

export function Heading({ value, level = 2 }) {
  const lvl = Math.min(6, Math.max(1, level))
  const Tag = `h${lvl}`
  return <Tag style={{ margin: `${HEADING_TOP[lvl] ?? '1rem'} 0 0.5rem` }}>{value}</Tag>
}

export function Badge({ value, variant, tone }) {
  return <span style={badgeStyle({ variant, tone })}>{value}</span>
}

export function Divider() {
  return <hr style={{ border: 0, borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />
}

export function Link({ label, to, tone }) {
  return (
    <a href={to} style={{ color: tone ? (TONE[tone] ?? 'var(--color-primary)') : 'var(--color-primary, #2563eb)' }}>
      {label}
    </a>
  )
}

// Render inline markdown nodes (text / strong / em / code / link) to elements.
function MdInline({ nodes }) {
  return nodes.map((n, i) => {
    if (n.type === 'strong') return <strong key={i}>{n.value}</strong>
    if (n.type === 'em') return <em key={i}>{n.value}</em>
    if (n.type === 'code') return <code key={i} style={mdInlineCodeStyle}>{n.value}</code>
    if (n.type === 'link') return <a key={i} href={n.href} style={mdLinkStyle}>{n.value}</a>
    return <span key={i}>{n.value}</span>
  })
}

// Markdown: a dep-free renderer over the shared parser (headings / lists / emphasis / code / links /
// quotes). Not a full engine - for tables/GFM/footnotes, swap it: registerBlockRenderer('markdown', ...).
export function Markdown({ source }) {
  const blocks = parseMarkdown(source)
  return (
    <div data-slot="markdown" style={mdRootStyle}>
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          const Hd = `h${b.level}`
          return <Hd key={i} style={mdHeadingStyle(b.level)}><MdInline nodes={b.inline} /></Hd>
        }
        if (b.type === 'p') return <p key={i} style={mdParaStyle}><MdInline nodes={b.inline} /></p>
        if (b.type === 'ul') return <ul key={i} style={mdListStyle}>{b.items.map((it, j) => <li key={j}><MdInline nodes={it} /></li>)}</ul>
        if (b.type === 'ol') return <ol key={i} style={mdListStyle}>{b.items.map((it, j) => <li key={j}><MdInline nodes={it} /></li>)}</ol>
        if (b.type === 'blockquote') return <blockquote key={i} style={mdQuoteStyle}><MdInline nodes={b.inline} /></blockquote>
        if (b.type === 'code') return <pre key={i} style={mdCodeBlockStyle}><code>{b.text}</code></pre>
        if (b.type === 'hr') return <hr key={i} style={mdHrStyle} />
        return null
      })}
    </div>
  )
}

// A stat card. `value` is shown when present; `source` is an expression the app/data layer
// evaluates (not evaluated here), so it falls back to an em dash until wired.
export function Stat({ title, value }) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius, 10px)', padding: '1rem' }}>
      <div style={{ color: 'var(--color-muted)', fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text)' }}>{value ?? '—'}</div>
    </div>
  )
}

registerBlockRenderer('text', Text)
registerBlockRenderer('list', List)
registerBlockRenderer('heading', Heading)
registerBlockRenderer('badge', Badge)
registerBlockRenderer('divider', Divider)
registerBlockRenderer('link', Link)
registerBlockRenderer('markdown', Markdown)
registerBlockRenderer('stat', Stat)
