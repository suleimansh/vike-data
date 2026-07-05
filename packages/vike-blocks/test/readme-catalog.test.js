// Drift-check for the README "Full catalog" table (#659): it claims "every built-in builder", so
// pin that it lists each registered block exactly once. Adding a block without a table row (or
// leaving a stale row behind) fails here instead of silently rotting the docs.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describeBlocks } from '../index.js'

// The builder you actually call for a block, derived from its catalog example (e.g. the
// `dataTable(...)` example -> `dataTable`). The few blocks with no example (stat, custom) are
// authored by their bare type name, which is what the table lists.
const builderName = (b) => {
  const m = b.example && String(b.example).match(/^[A-Za-z0-9_]+/)
  return m ? m[0] : b.type
}

// The `token`s inside the "### Full catalog" table rows in the README (the Group column has no
// backticks, so every backtick token in a table row is a block).
function readmeCatalogTokens() {
  const lines = readFileSync(new URL('../README.md', import.meta.url), 'utf8').split('\n')
  const start = lines.findIndex((l) => l.startsWith('### Full catalog'))
  assert.notEqual(start, -1, 'README is missing the "### Full catalog" section')
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#{2,3} /.test(lines[i])) {
      end = i
      break
    }
  }
  const tokens = []
  for (const line of lines.slice(start, end)) {
    if (!line.startsWith('|')) continue
    for (const m of line.matchAll(/`([^`]+)`/g)) tokens.push(m[1])
  }
  return tokens
}

test('the README Full-catalog table lists every built-in block exactly once (no drift)', () => {
  const documented = readmeCatalogTokens()
  const canonical = describeBlocks().map(builderName)

  const dupes = documented.filter((t, i) => documented.indexOf(t) !== i)
  assert.deepEqual(dupes, [], `the catalog table lists these builders more than once: ${dupes.join(', ')}`)

  const documentedSet = new Set(documented)
  const canonicalSet = new Set(canonical)
  const missing = canonical.filter((b) => !documentedSet.has(b)).sort()
  const extra = documented.filter((b) => !canonicalSet.has(b)).sort()
  assert.deepEqual(missing, [], `built-in blocks missing from the README catalog table: ${missing.join(', ')}`)
  assert.deepEqual(extra, [], `README catalog table lists blocks that are not registered: ${extra.join(', ')}`)
})
