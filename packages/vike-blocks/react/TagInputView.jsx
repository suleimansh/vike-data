// The React renderer for the `tag-input` block — a dep-free, theme-native token field. Removable chips
// plus a borderless input: type + Enter (or comma) adds a tag, Backspace on an empty input removes the
// last, a chip's x removes it. An optional `suggestions` pool drives an autocomplete dropdown (arrow
// keys + Enter, click to add). The tag list is local UI state initialised from `value`, so SSR and the
// first client render agree (dropdown is focus-gated + hidden on the server -> no hydration mismatch).
// With a `name`, hidden inputs carry the values for a native submit. Styles + filtering come from the
// shared tag-input-styles module, so this can't drift from the Vue twin.
import { useState, useRef } from 'react'
import { registerBlockRenderer } from './registry.js'
import {
  TAG_REMOVE_PATH,
  tagWrapStyle,
  tagFieldStyle,
  tagChipStyle,
  tagRemoveStyle,
  tagInnerInputStyle,
  tagSuggestionsStyle,
  tagSuggestionItemStyle,
  tagEmptyStyle,
  filterSuggestions,
  TAG_INPUT_STYLE_TAG,
} from '../blocks/tag-input-styles.js'

export function TagInputView({ value = [], suggestions = [], placeholder = 'Add a tag...', name = null, max = null, disabled = false }) {
  const [tags, setTags] = useState(value)
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef(null)

  const atMax = max != null && tags.length >= max
  const filtered = focused && suggestions.length ? filterSuggestions(suggestions, tags, query) : []
  const showList = filtered.length > 0

  const addTag = (raw) => {
    const t = String(raw).trim()
    if (!t || tags.includes(t) || atMax) return
    setTags((cur) => [...cur, t])
    setQuery('')
    setActive(-1)
  }
  const removeTag = (t) => setTags((cur) => cur.filter((x) => x !== t))

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (active >= 0 && active < filtered.length) addTag(filtered[active])
      else addTag(query)
    } else if (e.key === 'Backspace' && !query && tags.length) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'ArrowDown' && showList) {
      e.preventDefault()
      setActive((i) => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp' && showList) {
      e.preventDefault()
      setActive((i) => (i <= 0 ? filtered.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setFocused(false)
    }
  }

  return (
    <div style={tagWrapStyle()}>
      <style>{TAG_INPUT_STYLE_TAG}</style>
      <div
        className="vike-blocks-taginput"
        data-slot="tag-input"
        style={tagFieldStyle(disabled)}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {tags.map((t) => (
          <span key={t} style={tagChipStyle()} data-slot="tag">
            <span>{t}</span>
            {!disabled && (
              <button type="button" className="vike-blocks-tagremove" aria-label={`Remove ${t}`} onClick={() => removeTag(t)} style={tagRemoveStyle()}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
                  <path d={TAG_REMOVE_PATH} />
                </svg>
              </button>
            )}
          </span>
        ))}
        {name && tags.map((t) => <input key={`h-${t}`} type="hidden" name={name} value={t} />)}
        {!disabled && (
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder={tags.length === 0 ? placeholder : atMax ? '' : '+'}
            style={tagInnerInputStyle()}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(-1)
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label={placeholder}
          />
        )}
      </div>
      {showList && (
        // preventDefault on mousedown so clicking a suggestion doesn't blur the input first.
        <div style={tagSuggestionsStyle()} onMouseDown={(e) => e.preventDefault()} data-slot="tag-suggestions">
          {filtered.map((s, i) => (
            <button
              key={s}
              type="button"
              className="vike-blocks-tagsuggest"
              style={tagSuggestionItemStyle(i === active)}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                addTag(s)
                inputRef.current?.focus()
              }}
            >
              {s}
            </button>
          ))}
          {filtered.length === 0 && <div style={tagEmptyStyle()}>No matches</div>}
        </div>
      )}
    </div>
  )
}

registerBlockRenderer('tag-input', TagInputView)
