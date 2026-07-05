// The built-in leaf BLOCKS, defined through the same `defineBlock` seam a third party
// uses — so our primitives and someone's `vike-block-rating` are peers, not special cases.
// Each is a lowercase factory (matching vike-crud's column()/field() idiom) whose `.build()`
// collapses to a plain leaf-block descriptor; it drops straight into a page's `sections`.
//
//   definePage({
//     sections: [
//       heading('Post').level(2),
//       badge('Draft').tone('warning'),
//       divider(),
//       link('Back to posts').to('/posts'),
//     ],
//   })
//
// Display-only for now (text / heading / badge / divider / link). Interactivity — a button
// that DOES something — is a separate axis (behavior can't be an inline closure in
// serializable config); `link().to(path)` covers declarative navigation meanwhile.
import { defineBlock } from './registry.js'

// A run of text on the shadcn Base typography surface. `.variant()` picks the text style
// ('lead' / 'muted' / 'blockquote' / 'code'; default is a plain span); `.tone()` is the advisory
// color token ('muted' / 'danger' / ...) and composes with a variant.
export const text = defineBlock('text', {
  build: (value) => ({ value }),
  refine: { variant: (v) => ({ variant: v }), tone: (token) => ({ tone: token }) },
  category: 'content',
  summary: 'A run of body text with an optional style variant and tone.',
  example: "text('Body copy').tone('muted')",
})

// A list, unordered by default. `.ordered()` makes it a numbered (<ol>) list. `items` is an array
// of strings — the display-only shadcn list surface (indented, spaced items).
export const list = defineBlock('list', {
  build: (items) => ({ items: items ?? [], ordered: false }),
  refine: { ordered: () => ({ ordered: true }) },
  category: 'content',
  summary: 'A bulleted (or numbered) list of strings.',
  example: "list(['First', 'Second']).ordered()",
})

// A section heading. `.level()` sets the rank (1-6); defaults to 2.
export const heading = defineBlock('heading', {
  build: (value) => ({ value, level: 2 }),
  refine: { level: (n) => ({ level: n }) },
  category: 'content',
  summary: 'A section heading, rank 1-6 (default 2).',
  example: "heading('Overview').level(2)",
})

// A small status pill on the shadcn Base badge surface. `.variant()` picks the surface
// ('default' / 'secondary' / 'destructive' / 'outline'); `.tone()` is the historical semantic
// intent ('success' / 'warning' / ...), kept for back-compat and rendered as a soft accent tint.
export const badge = defineBlock('badge', {
  build: (value) => ({ value }),
  refine: { variant: (v) => ({ variant: v }), tone: (token) => ({ tone: token }) },
  category: 'content',
  summary: 'A small status pill.',
  example: "badge('Beta').tone('info')",
})

// A horizontal rule. Terminal today, but still a builder so it composes uniformly.
export const divider = defineBlock('divider', {
  build: () => ({}),
  category: 'content',
  summary: 'A horizontal rule.',
  example: 'divider()',
})

// A navigation link. `.to()` is a declarative path (no closure, stays serializable) — the
// display-only stand-in for an action until the actions layer lands. `.tone()` styles it.
export const link = defineBlock('link', {
  build: (label) => ({ label }),
  refine: { to: (path) => ({ to: path }), tone: (token) => ({ tone: token }) },
  category: 'content',
  summary: 'A declarative navigation link.',
  example: "link('Docs').to('/docs')",
})
