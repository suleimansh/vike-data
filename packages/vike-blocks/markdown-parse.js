// A tiny, dep-free markdown parser shared by the react + vue Markdown renderers, so the block
// actually renders (headings / lists / emphasis / code / links / quotes) instead of dumping the raw
// source. It is a pragmatic common subset, NOT a spec-compliant engine - for tables, footnotes, GFM,
// etc. an app swaps in a real renderer with registerBlockRenderer('markdown', ...). Output is a plain
// serializable node tree (no HTML string, so the renderers build real elements and there is no
// dangerouslySetInnerHTML / XSS surface).
//
//   parseMarkdown('# Hi\n\nSome **bold** and `code`.')
//   -> [ { type:'heading', level:1, inline:[...] }, { type:'p', inline:[...] } ]

// Split a line of text into inline nodes: text / strong / em / code / link. Non-nested (bold text is
// plain), which covers ordinary prose; heavier needs are the swap-a-real-renderer story. `_`/`__`
// emphasis is word-boundary guarded so snake_case identifiers don't turn italic.
export function parseInline(text) {
  const nodes = []
  const src = String(text ?? '')
  const push = (v) => {
    if (v) nodes.push({ type: 'text', value: v })
  }
  // Order matters: code first (its content is literal), then strong before em, links last.
  const re = /(`[^`]+`)|(\*\*[^*]+?\*\*)|(?<![\w*])__[^_]+?__(?![\w])|(\*[^*\s][^*]*?\*)|(?<![\w])_[^_\s][^_]*?_(?![\w])|(\[[^\]]+?\]\([^)\s]+?\))/
  let rest = src
  let m
  while ((m = re.exec(rest))) {
    push(rest.slice(0, m.index))
    const tok = m[0]
    if (tok.startsWith('`')) nodes.push({ type: 'code', value: tok.slice(1, -1) })
    else if (tok.startsWith('**')) nodes.push({ type: 'strong', value: tok.slice(2, -2) })
    else if (tok.startsWith('__')) nodes.push({ type: 'strong', value: tok.slice(2, -2) })
    else if (tok.startsWith('*')) nodes.push({ type: 'em', value: tok.slice(1, -1) })
    else if (tok.startsWith('_')) nodes.push({ type: 'em', value: tok.slice(1, -1) })
    else {
      const lm = /^\[([^\]]+?)\]\(([^)\s]+?)\)$/.exec(tok)
      nodes.push({ type: 'link', href: lm[2], value: lm[1] })
    }
    rest = rest.slice(m.index + tok.length)
  }
  push(rest)
  return nodes
}

const HEADING = /^(#{1,6})\s+(.*)$/
const UL_ITEM = /^[-*+]\s+(.*)$/
const OL_ITEM = /^\d+\.\s+(.*)$/
const QUOTE = /^>\s?(.*)$/
const HR = /^(?:---+|\*\*\*+|___+)\s*$/
const FENCE = /^```(.*)$/

// Parse a markdown source into a flat list of block nodes. Blank lines break paragraphs; consecutive
// list items group into one list; a ``` fence captures a literal code block.
export function parseMarkdown(source) {
  const lines = String(source ?? '').split('\n')
  const blocks = []
  let para = [] // accumulating paragraph lines
  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', inline: parseInline(para.join(' ')) })
      para = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const fence = line.match(FENCE)
    if (fence) {
      flushPara()
      const lang = fence[1].trim()
      const body = []
      i++
      while (i < lines.length && !FENCE.test(lines[i])) body.push(lines[i++])
      blocks.push({ type: 'code', lang, text: body.join('\n') })
      continue
    }

    if (line.trim() === '') {
      flushPara()
      continue
    }
    if (HR.test(line)) {
      flushPara()
      blocks.push({ type: 'hr' })
      continue
    }
    const h = line.match(HEADING)
    if (h) {
      flushPara()
      blocks.push({ type: 'heading', level: h[1].length, inline: parseInline(h[2]) })
      continue
    }
    const q = line.match(QUOTE)
    if (q) {
      flushPara()
      const body = [q[1]]
      while (i + 1 < lines.length && QUOTE.test(lines[i + 1])) body.push(lines[++i].match(QUOTE)[1])
      blocks.push({ type: 'blockquote', inline: parseInline(body.join(' ')) })
      continue
    }
    const ul = line.match(UL_ITEM)
    const ol = line.match(OL_ITEM)
    if (ul || ol) {
      flushPara()
      const ordered = !!ol
      const itemRe = ordered ? OL_ITEM : UL_ITEM
      const items = [parseInline((ul || ol)[1])]
      while (i + 1 < lines.length && itemRe.test(lines[i + 1])) items.push(parseInline(lines[++i].match(itemRe)[1]))
      blocks.push({ type: ordered ? 'ol' : 'ul', items })
      continue
    }

    para.push(line)
  }
  flushPara()
  return blocks
}

// Shared, theme-native styles for the rendered markdown, imported by both renderers so they can't
// drift. Every color reads a vike-themes CSS var with a light fallback.
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

export const mdRootStyle = { lineHeight: 1.6, color: 'var(--color-text, #0f172a)' }
export const mdParaStyle = { margin: '0.6rem 0' }
export const mdLinkStyle = { color: 'var(--color-primary, #2563eb)' }
export const mdListStyle = { margin: '0.6rem 0', paddingLeft: '1.5rem' }
export const mdQuoteStyle = {
  margin: '0.6rem 0',
  padding: '0.25rem 0 0.25rem 1rem',
  borderLeft: '3px solid var(--color-border, #e2e8f0)',
  color: 'var(--color-muted, #64748b)',
}
export const mdInlineCodeStyle = {
  fontFamily: MONO,
  fontSize: '0.9em',
  background: 'var(--color-surface, #f1f5f9)',
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: '4px',
  padding: '0.1em 0.35em',
}
export const mdCodeBlockStyle = {
  fontFamily: MONO,
  fontSize: '13px',
  background: 'var(--color-code-bg, var(--color-surface, #f8fafc))',
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: 'var(--radius, 8px)',
  padding: '0.75rem',
  overflowX: 'auto',
  margin: '0.6rem 0',
}
export const mdHrStyle = { border: 0, borderTop: '1px solid var(--color-border, #e2e8f0)', margin: '1rem 0' }

// Heading size/weight by level (h1 largest). Kept modest so markdown headings sit inside prose.
const H_SIZES = { 1: '1.6rem', 2: '1.35rem', 3: '1.15rem', 4: '1rem', 5: '0.9rem', 6: '0.85rem' }
export const mdHeadingStyle = (level) => ({ fontSize: H_SIZES[level] ?? '1rem', fontWeight: 600, lineHeight: 1.3, margin: '1rem 0 0.4rem' })
