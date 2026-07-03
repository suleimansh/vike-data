// The React renderer for the `attachment` block — a dep-free, theme-native file-upload control. A
// dashed drop zone (a <label> wrapping a hidden file input, so a click opens the picker and a drag
// highlights the border) above the list of selected files, each removable. It lists its own selection
// (value binding + the real upload are the actions axis #385), so declared `files` are the INITIAL
// list and SSR agrees with the first client render. The zone, the file rows, and the byte formatter
// live in the shared attachment-styles module, so this stays a thin binding and can't drift from Vue.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import {
  ATTACHMENT_ICON_PATH,
  formatBytes,
  attachmentRootStyle,
  attachmentZoneStyle,
  attachmentIconStyle,
  attachmentPromptStyle,
  attachmentHintStyle,
  attachmentListStyle,
  attachmentFileStyle,
  attachmentNameStyle,
  attachmentSizeStyle,
  attachmentRemoveStyle,
  ATTACHMENT_STYLE_TAG,
} from '../blocks/attachment-styles.js'

export function AttachmentView({ label, accept, multiple = false, disabled = false, name, files = [] }) {
  const [list, setList] = useState(files)
  const [dragOver, setDragOver] = useState(false)

  const take = (fileList) => {
    const picked = Array.from(fileList || []).map((f) => ({ name: f.name, size: f.size, type: f.type }))
    if (picked.length) setList(multiple ? picked : picked.slice(0, 1))
  }
  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (!disabled) take(e.dataTransfer.files)
  }

  return (
    <div style={attachmentRootStyle()} data-slot="attachment">
      <style>{ATTACHMENT_STYLE_TAG}</style>
      <label
        className="vike-blocks-attachment"
        aria-disabled={disabled || undefined}
        style={attachmentZoneStyle(disabled, dragOver)}
        onDragOver={(e) => {
          if (disabled) return
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={attachmentIconStyle()} aria-hidden="true">
          <path d={ATTACHMENT_ICON_PATH} />
        </svg>
        <span style={attachmentPromptStyle()}>{label ?? 'Drop files here or click to upload'}</span>
        {accept && <span style={attachmentHintStyle()}>{accept}</span>}
        <input type="file" accept={accept} multiple={multiple} name={name} disabled={disabled} onChange={(e) => take(e.target.files)} style={{ display: 'none' }} />
      </label>
      {list.length > 0 && (
        <ul style={attachmentListStyle()}>
          {list.map((f, i) => (
            <li key={i} style={attachmentFileStyle()}>
              <span style={attachmentNameStyle()}>{f.name}</span>
              <span style={attachmentSizeStyle()}>{formatBytes(f.size)}</span>
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  className="vike-blocks-attachment-x"
                  style={attachmentRemoveStyle()}
                  onClick={() => setList((l) => l.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

registerBlockRenderer('attachment', AttachmentView)
