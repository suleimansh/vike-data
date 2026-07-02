// The Vue components for the built-in leaf blocks, registered against their block types. The
// Vue twin of vike-blocks/react/blocks.jsx. Written as functional components (a function of
// props with an explicit `.props` list) — the closest Vue analog to React's function components,
// so no .vue compile step and the same shape as the React side. Each receives the block's
// resolved view-model as props. Importing this module registers the built-ins as a side effect.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { badgeStyle } from '../badge-styles.js'
import { resolveTextStyle, listStyle, listItemStyle } from '../typography-styles.js'

const TONE = { muted: 'var(--color-muted)', danger: 'var(--color-danger, #dc2626)', success: 'var(--color-success, #16a34a)', info: 'var(--color-primary, #2563eb)' }

// A run of text on the shadcn Base typography surface: `.variant()` picks lead / muted /
// blockquote / inline code (default is a plain span); a known `.tone()` tints the color.
export const Text = (props) => {
  const { tag, style } = resolveTextStyle(props.variant, props.tone)
  return h(tag, { style }, props.value)
}
Text.props = ['value', 'variant', 'tone']

// An ordered/unordered list of strings on the shadcn list surface.
export const List = (props) =>
  h(
    props.ordered ? 'ol' : 'ul',
    { style: listStyle(props.ordered) },
    (props.items ?? []).map((item) => h('li', { style: listItemStyle }, item)),
  )
List.props = ['items', 'ordered']

// Top margin scales with level so sections breathe: a page-title h1 stays flush (usually the first
// block on a page), while an h2/h3 section heading separates from the block above it.
const HEADING_TOP = { 1: '0', 2: '1.5rem', 3: '1.25rem' }

export const Heading = (props) => {
  const level = Math.min(6, Math.max(1, props.level ?? 2))
  return h(`h${level}`, { style: { margin: `${HEADING_TOP[level] ?? '1rem'} 0 0.5rem` } }, props.value)
}
Heading.props = ['value', 'level']

export const Badge = (props) => h('span', { style: badgeStyle({ variant: props.variant, tone: props.tone }) }, props.value)
Badge.props = ['value', 'variant', 'tone']

export const Divider = () => h('hr', { style: { border: 0, borderTop: '1px solid var(--color-border)', margin: '1rem 0' } })
Divider.props = []

export const Link = (props) => h('a', { href: props.to, style: { color: props.tone ? (TONE[props.tone] ?? 'var(--color-primary)') : 'var(--color-primary, #2563eb)' } }, props.label)
Link.props = ['label', 'to', 'tone']

export const Markdown = (props) => h('div', { style: { whiteSpace: 'pre-wrap' } }, props.source)
Markdown.props = ['source']

export const Stat = (props) =>
  h('div', { style: { border: '1px solid var(--color-border)', borderRadius: 'var(--radius, 10px)', padding: '1rem' } }, [
    h('div', { style: { color: 'var(--color-muted)', fontSize: '13px' } }, props.title),
    h('div', { style: { fontSize: '24px', fontWeight: 600, color: 'var(--color-text)' } }, props.value ?? '—'),
  ])
Stat.props = ['title', 'value']

registerBlockRenderer('text', Text)
registerBlockRenderer('list', List)
registerBlockRenderer('heading', Heading)
registerBlockRenderer('badge', Badge)
registerBlockRenderer('divider', Divider)
registerBlockRenderer('link', Link)
registerBlockRenderer('markdown', Markdown)
registerBlockRenderer('stat', Stat)
