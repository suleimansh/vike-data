// Shared, framework-agnostic guts of the `code` block, imported by the block's `resolve` AND by both
// renderers so nothing can drift: a tiny dep-free tokenizer, the kibo-style `[!code ...]` marker
// parser, and the theme-native style/color constants. The source is kibo-ui's code-block, but that
// leans on Shiki (a WASM grammar highlighter) — against the house rule of zero runtime deps — so
// here highlighting is a small, generic lexical pass (comment / string / keyword / number). It is not
// grammar-accurate; the genuine long tail (exact language grammars) ejects to a custom block that can
// pull in Shiki. `.plain()` turns tokenizing off entirely.

// A generic keyword set biased to the C-like / JS / TS family, with a scatter of common cross-language
// keywords so a shell / python / rust snippet still gets some color. Intentionally not per-language.
const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'class', 'extends', 'super', 'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'void', 'delete', 'yield', 'await', 'async',
  'import', 'export', 'from', 'as', 'default', 'try', 'catch', 'finally', 'throw', 'with', 'static', 'get', 'set',
  'true', 'false', 'null', 'undefined', 'NaN',
  'interface', 'type', 'enum', 'implements', 'public', 'private', 'protected', 'readonly', 'abstract', 'namespace', 'declare',
  'keyof', 'infer', 'satisfies',
  'def', 'end', 'then', 'elif', 'fn', 'pub', 'use', 'struct', 'impl', 'match', 'func', 'package', 'nil', 'None', 'True',
  'False', 'and', 'or', 'not', 'lambda', 'print', 'echo',
])

// Languages whose line comments start with `#` (so we don't miscolor JS private fields `#x` as comments).
const HASH_COMMENT_LANGS = new Set([
  'sh', 'bash', 'shell', 'zsh', 'yaml', 'yml', 'py', 'python', 'ruby', 'rb', 'toml', 'ini', 'conf', 'dockerfile',
  'makefile', 'make', 'r', 'perl', 'pl',
])

const isIdStart = (ch) => /[A-Za-z_$]/.test(ch)
const isId = (ch) => /[A-Za-z0-9_$]/.test(ch)

// Tokenize a whole source string into an array of LINES, each an array of `{ t, c }` tokens (text +
// color key). Scanning the whole string at once (not line by line) keeps multi-line strings and block
// comments correctly colored; tokens that straddle a newline are split so each line stands alone. The
// number of lines equals `code.split('\n').length`, so it aligns 1:1 with the marker flags.
export function tokenizeLines(code, lang) {
  const src = String(code ?? '')
  const hash = HASH_COMMENT_LANGS.has(String(lang ?? '').toLowerCase())
  const lines = [[]]
  // Append `text` (which may contain newlines) as tokens of color `c`, opening a new line per '\n'.
  const push = (text, c) => {
    const parts = text.split('\n')
    parts.forEach((p, i) => {
      if (i > 0) lines.push([])
      if (p) lines[lines.length - 1].push({ t: p, c })
    })
  }
  let i = 0
  const n = src.length
  while (i < n) {
    const ch = src[i]
    // block comment /* ... */ (may span lines)
    if (ch === '/' && src[i + 1] === '*') {
      let j = src.indexOf('*/', i + 2)
      j = j === -1 ? n : j + 2
      push(src.slice(i, j), 'comment')
      i = j
      continue
    }
    // line comment //
    if (ch === '/' && src[i + 1] === '/') {
      let j = src.indexOf('\n', i)
      if (j === -1) j = n
      push(src.slice(i, j), 'comment')
      i = j
      continue
    }
    // hash comment (shell / yaml / python / ...)
    if (hash && ch === '#') {
      let j = src.indexOf('\n', i)
      if (j === -1) j = n
      push(src.slice(i, j), 'comment')
      i = j
      continue
    }
    // string / template literal (may span lines for backticks); honors backslash escapes
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1
      while (j < n) {
        if (src[j] === '\\') {
          j += 2
          continue
        }
        if (src[j] === ch) {
          j++
          break
        }
        j++
      }
      j = Math.min(j, n)
      push(src.slice(i, j), 'string')
      i = j
      continue
    }
    // number
    if (/[0-9]/.test(ch)) {
      let j = i + 1
      while (j < n && /[0-9a-fA-FxX._]/.test(src[j])) j++
      push(src.slice(i, j), 'number')
      i = j
      continue
    }
    // identifier / keyword
    if (isIdStart(ch)) {
      let j = i + 1
      while (j < n && isId(src[j])) j++
      const word = src.slice(i, j)
      push(word, KEYWORDS.has(word) ? 'keyword' : 'plain')
      i = j
      continue
    }
    // a run of whitespace / punctuation (and newlines) -> plain, stopping at the next special char
    let j = i + 1
    while (j < n) {
      const c2 = src[j]
      if (c2 === '/' && (src[j + 1] === '*' || src[j + 1] === '/')) break
      if (hash && c2 === '#') break
      if (c2 === '"' || c2 === "'" || c2 === '`') break
      if (/[0-9A-Za-z_$]/.test(c2)) break
      j++
    }
    push(src.slice(i, j), 'plain')
    i = j
  }
  return lines
}

// A trailing decoration marker on a line: `// [!code highlight]`, `# [!code ++]`, `[!code --]`, etc.
// The comment lead-in (`//`, `#`, `;`, `--`, `<!--`, `/*`) is optional and stripped along with the marker.
const MARKER = /\s*(?:\/\/|#|;|--|<!--|\/\*)?\s*\[!code (highlight|\+\+|--|focus)\]\s*(?:-->|\*\/)?\s*$/

// Parse kibo-style decoration markers out of the source. Returns the cleaned source (markers removed)
// and a per-line `flags` array — one `{ hl, diff, focus }` per line, aligned to `code.split('\n')`.
export function parseMarkers(code) {
  const lines = String(code ?? '').split('\n')
  const flags = []
  const clean = lines.map((line) => {
    const m = line.match(MARKER)
    if (!m) {
      flags.push({ hl: false, diff: null, focus: false })
      return line
    }
    const kind = m[1]
    flags.push({
      hl: kind === 'highlight',
      diff: kind === '++' ? 'add' : kind === '--' ? 'remove' : null,
      focus: kind === 'focus',
    })
    return line.slice(0, line.length - m[0].length)
  })
  return { clean: clean.join('\n'), flags }
}

// Theme-native token colors: each reads a code-specific CSS var, falling back to a general theme var,
// then a light-theme literal. A theme (or a dark mode) overrides `--color-code-*` to recolor the syntax.
export const TOKEN_COLORS = {
  comment: 'var(--color-code-comment, var(--color-muted, #64748b))',
  string: 'var(--color-code-string, #16a34a)',
  keyword: 'var(--color-code-keyword, #7c3aed)',
  number: 'var(--color-code-number, #ea580c)',
  plain: 'var(--color-code-fg, var(--color-text, #0f172a))',
}

export const codeSurfaceStyle = {
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: 'var(--radius, 8px)',
  overflow: 'hidden',
  background: 'var(--color-code-bg, var(--color-surface, #f8fafc))',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '13px',
}

export const codeHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.4rem 0.75rem',
  borderBottom: '1px solid var(--color-border, #e2e8f0)',
  background: 'var(--color-surface, #f1f5f9)',
  fontSize: '12px',
  color: 'var(--color-muted, #64748b)',
}

// Per-line tint (diff / highlight) and its left-border accent.
export const LINE_BG = {
  add: 'var(--color-code-add-bg, rgba(22, 163, 74, 0.12))',
  remove: 'var(--color-code-remove-bg, rgba(220, 38, 38, 0.12))',
  hl: 'var(--color-code-hl-bg, rgba(37, 99, 235, 0.10))',
}
export const LINE_ACCENT = {
  add: 'var(--color-success, #16a34a)',
  remove: 'var(--color-danger, #dc2626)',
  hl: 'var(--color-primary, #2563eb)',
}
