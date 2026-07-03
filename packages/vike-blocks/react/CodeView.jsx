// The React renderer for the `code` block — a themed code surface with a filename header, a copy
// button, line-number gutter, and per-line decorations. Colors/tints all read the shared
// code-highlight module (vike-themes CSS vars), so this stays a thin binding and can't drift from the
// Vue twin. The copy button is the only client state (Copy -> Copied, then resets).
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { TOKEN_COLORS, codeSurfaceStyle, codeHeaderStyle, LINE_BG, LINE_ACCENT } from '../blocks/code-highlight.js'

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    try {
      navigator.clipboard?.writeText(code ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable (insecure context) — no-op */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy code"
      style={{
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: 'calc(var(--radius, 8px) - 3px)',
        background: 'var(--color-bg, #ffffff)',
        color: copied ? 'var(--color-success, #16a34a)' : 'var(--color-muted, #64748b)',
        fontSize: '11px',
        padding: '2px 8px',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function CodeView({ filename, lang, lineNumbers = true, copy = true, code = '', hasFocus = false, lines = [] }) {
  const showHeader = filename || lang || copy
  const gutterCh = String(lines.length).length
  return (
    <div data-slot="code" style={{ ...codeSurfaceStyle, margin: '0.75rem 0' }}>
      {showHeader && (
        <div style={codeHeaderStyle}>
          <span>{filename || ''}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {lang && <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lang}</span>}
            {copy && <CopyButton code={code} />}
          </span>
        </div>
      )}
      <pre style={{ margin: 0, padding: '0.75rem 0', overflowX: 'auto', color: TOKEN_COLORS.plain }}>
        <code style={{ display: 'block', minWidth: 'max-content' }}>
          {lines.map((line, i) => {
            const tint = line.diff ? LINE_BG[line.diff] : line.hl ? LINE_BG.hl : 'transparent'
            const accent = line.diff ? LINE_ACCENT[line.diff] : line.hl ? LINE_ACCENT.hl : 'transparent'
            const dim = hasFocus && !line.focus
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  padding: '0 0.75rem',
                  background: tint,
                  borderLeft: `2px solid ${accent}`,
                  opacity: dim ? 0.4 : 1,
                  transition: 'opacity 0.15s ease',
                  lineHeight: 1.6,
                  whiteSpace: 'pre',
                }}
              >
                {lineNumbers && (
                  <span
                    aria-hidden="true"
                    style={{ width: `${gutterCh}ch`, marginRight: '1rem', textAlign: 'right', color: 'var(--color-muted, #94a3b8)', userSelect: 'none', flex: '0 0 auto' }}
                  >
                    {i + 1}
                  </span>
                )}
                {line.diff && (
                  <span aria-hidden="true" style={{ width: '1ch', marginRight: '0.5rem', color: LINE_ACCENT[line.diff], flex: '0 0 auto' }}>
                    {line.diff === 'add' ? '+' : '-'}
                  </span>
                )}
                <span style={{ flex: '1 1 auto' }}>
                  {line.tokens.length ? (
                    line.tokens.map((tk, j) => (
                      <span key={j} style={{ color: TOKEN_COLORS[tk.c] || TOKEN_COLORS.plain }}>
                        {tk.t}
                      </span>
                    ))
                  ) : (
                    '​' /* zero-width space keeps a blank line at full height */
                  )}
                </span>
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}

registerBlockRenderer('code', CodeView)
