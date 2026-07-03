// The Vue renderer for the `code` block — the Vue twin of react/CodeView.jsx. A stateful component
// (setup with a `copied` ref for the copy button); everything else reads the shared code-highlight
// module (tokens + tints as vike-themes CSS vars), so it can't drift from the React renderer.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { TOKEN_COLORS, codeSurfaceStyle, codeHeaderStyle, LINE_BG, LINE_ACCENT } from '../blocks/code-highlight.js'

export const CodeView = {
  props: ['filename', 'lang', 'lineNumbers', 'copy', 'code', 'hasFocus', 'lines'],
  setup(props) {
    const copied = ref(false)
    const doCopy = () => {
      try {
        navigator.clipboard?.writeText(props.code ?? '')
        copied.value = true
        setTimeout(() => (copied.value = false), 1500)
      } catch {
        /* clipboard unavailable — no-op */
      }
    }

    return () => {
      const lineNumbers = props.lineNumbers !== false
      const copy = props.copy !== false
      const lines = props.lines ?? []
      const gutterCh = String(lines.length).length
      const showHeader = props.filename || props.lang || copy

      const header =
        showHeader &&
        h('div', { style: codeHeaderStyle }, [
          h('span', props.filename || ''),
          h('span', { style: { display: 'flex', alignItems: 'center', gap: '0.6rem' } }, [
            props.lang && h('span', { style: { textTransform: 'uppercase', letterSpacing: '0.04em' } }, props.lang),
            copy &&
              h(
                'button',
                {
                  type: 'button',
                  'aria-label': 'Copy code',
                  onClick: doCopy,
                  style: {
                    border: '1px solid var(--color-border, #e2e8f0)',
                    borderRadius: 'calc(var(--radius, 8px) - 3px)',
                    background: 'var(--color-bg, #ffffff)',
                    color: copied.value ? 'var(--color-success, #16a34a)' : 'var(--color-muted, #64748b)',
                    fontSize: '11px',
                    padding: '2px 8px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  },
                },
                copied.value ? 'Copied' : 'Copy',
              ),
          ]),
        ])

      const rows = lines.map((line, i) => {
        const tint = line.diff ? LINE_BG[line.diff] : line.hl ? LINE_BG.hl : 'transparent'
        const accent = line.diff ? LINE_ACCENT[line.diff] : line.hl ? LINE_ACCENT.hl : 'transparent'
        const dim = props.hasFocus && !line.focus
        return h(
          'div',
          {
            key: i,
            style: {
              display: 'flex',
              padding: '0 0.75rem',
              background: tint,
              borderLeft: `2px solid ${accent}`,
              opacity: dim ? 0.4 : 1,
              transition: 'opacity 0.15s ease',
              lineHeight: 1.6,
              whiteSpace: 'pre',
            },
          },
          [
            lineNumbers &&
              h(
                'span',
                {
                  'aria-hidden': 'true',
                  style: { width: `${gutterCh}ch`, marginRight: '1rem', textAlign: 'right', color: 'var(--color-muted, #94a3b8)', userSelect: 'none', flex: '0 0 auto' },
                },
                String(i + 1),
              ),
            line.diff &&
              h('span', { 'aria-hidden': 'true', style: { width: '1ch', marginRight: '0.5rem', color: LINE_ACCENT[line.diff], flex: '0 0 auto' } }, line.diff === 'add' ? '+' : '-'),
            h(
              'span',
              { style: { flex: '1 1 auto' } },
              line.tokens.length ? line.tokens.map((tk, j) => h('span', { key: j, style: { color: TOKEN_COLORS[tk.c] || TOKEN_COLORS.plain } }, tk.t)) : '​',
            ),
          ],
        )
      })

      const pre = h('pre', { style: { margin: 0, padding: '0.75rem 0', overflowX: 'auto', color: TOKEN_COLORS.plain } }, [
        h('code', { style: { display: 'block', minWidth: 'max-content' } }, rows),
      ])

      return h('div', { 'data-slot': 'code', style: { ...codeSurfaceStyle, margin: '0.75rem 0' } }, [header, pre])
    }
  },
}

registerBlockRenderer('code', CodeView)
