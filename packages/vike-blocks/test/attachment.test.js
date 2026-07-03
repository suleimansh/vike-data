// The attachment block: a dep-free, theme-native file-upload control (defineBlock, type 'attachment',
// builder `attachment`) with label / accept / multiple / disabled / name / files refinements. The
// renderer is not node:test-tested (JSX/Vue stateful, drag + file input), so this covers the agnostic
// builder + resolve plus the shared style/format module (byte formatting, the zone/drag states tag).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { attachment, field, definePage, resolvePage, hasBlock } from '../index.js'
import { formatBytes, attachmentZoneStyle, ATTACHMENT_STYLE_TAG, ATTACHMENT_ICON_PATH } from '../blocks/attachment-styles.js'

test('attachment is registered', () => {
  assert.ok(hasBlock('attachment'))
})

test('the builder collapses to a descriptor of type "attachment" (label optional)', () => {
  assert.deepEqual(attachment().build(), { block: 'attachment' })
  assert.deepEqual(attachment().accept('image/*').multiple().build(), { block: 'attachment', accept: 'image/*', multiple: true })
  const files = [{ name: 'report.pdf', size: 248000 }]
  assert.deepEqual(attachment('Drop your resume').accept('.pdf').disabled().name('cv').files(files).build(), {
    block: 'attachment',
    label: 'Drop your resume',
    accept: '.pdf',
    disabled: true,
    name: 'cv',
    files,
  })
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [attachment('Files').accept('image/*').multiple()] }))
  assert.equal(out.sections[0].block, 'attachment')
  assert.deepEqual(out.sections[0].resolved, { label: 'Files', accept: 'image/*', multiple: true })
})

test('composes as a field control', () => {
  const out = resolvePage(definePage({ sections: [field('Resume').control(attachment().accept('.pdf'))] }))
  assert.equal(out.sections[0].resolved.control.block, 'attachment')
  assert.deepEqual(out.sections[0].resolved.control.resolved, { accept: '.pdf' })
})

test('formatBytes renders a short human size, or "" when missing/invalid', () => {
  assert.equal(formatBytes(500), '500 B')
  assert.equal(formatBytes(1536), '1.5 KB')
  assert.equal(formatBytes(1048576), '1.0 MB')
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB')
  assert.equal(formatBytes(undefined), '') // declared file without a size
  assert.equal(formatBytes(-1), '')
  assert.equal(formatBytes(NaN), '')
})

test('attachmentZoneStyle turns the border primary on drag-over', () => {
  assert.match(attachmentZoneStyle(false, true).borderColor, /var\(--color-primary/)
  assert.match(attachmentZoneStyle(false, false).borderColor, /var\(--color-border/)
})

test('the states style tag covers hover, focus-within, and the remove button', () => {
  assert.match(ATTACHMENT_STYLE_TAG, /:hover\{border-color/)
  assert.match(ATTACHMENT_STYLE_TAG, /:focus-within\{[^}]*box-shadow/)
  assert.match(ATTACHMENT_STYLE_TAG, /attachment-x:hover/)
})

test('the upload icon path is a shared constant', () => {
  assert.ok(ATTACHMENT_ICON_PATH.length > 0)
})
