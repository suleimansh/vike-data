// Shared, framework-agnostic style data + filtering for the `tag-input` block, imported by BOTH the
// react and vue renderers so the surface + logic can't drift. A tag input is a token field: a wrapping
// box of removable chips followed by a borderless text input, with an optional autocomplete dropdown of
// suggestions. Theme-native (every color reads a vike-themes CSS var with a fallback). The
// :focus-within ring + hover states ride the `vike-blocks-taginput` classes + TAG_INPUT_STYLE_TAG.
import { normalizeQuery } from './_shared.js'

// A feather "x" for the chip remove button. viewBox 0 0 24 24.
export const TAG_REMOVE_PATH = 'M18 6 6 18 M6 6l12 12'

// The wrapping field box (flex-wrap so chips + input flow onto multiple rows).
export function tagFieldStyle(disabled) {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.35rem',
    minHeight: '2.4rem',
    padding: '0.3rem 0.4rem',
    border: '1px solid var(--color-border, #cbd5e1)',
    borderRadius: 'var(--radius, 8px)',
    background: disabled ? 'color-mix(in srgb, var(--color-muted, #64748b) 8%, var(--color-bg, #fff))' : 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #0f172a)',
    cursor: disabled ? 'default' : 'text',
    boxSizing: 'border-box',
  }
}

// One chip: a rounded muted pill carrying the label + (unless disabled) a remove button.
export function tagChipStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    height: '1.6rem',
    padding: '0 0.2rem 0 0.55rem',
    fontSize: '13px',
    lineHeight: 1,
    borderRadius: '999px',
    background: 'color-mix(in srgb, var(--color-muted, #64748b) 14%, transparent)',
    color: 'var(--color-text, #0f172a)',
  }
}

// The chip's remove button (an icon-sized bare button).
export const tagRemoveStyle = () => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.1rem',
  height: '1.1rem',
  padding: 0,
  border: 0,
  borderRadius: '999px',
  background: 'transparent',
  color: 'var(--color-muted, #64748b)',
  cursor: 'pointer',
})

// The borderless text input that grows to fill the rest of the row.
export const tagInnerInputStyle = () => ({
  flex: '1 1 6rem',
  minWidth: '6rem',
  height: '1.6rem',
  padding: '0 0.25rem',
  border: 0,
  outline: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  fontSize: '14px',
})

// The autocomplete dropdown, absolutely positioned below the field (its wrapper is position:relative).
export const tagWrapStyle = () => ({ position: 'relative', width: '100%' })
export function tagSuggestionsStyle() {
  return {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 50,
    marginTop: '4px',
    maxHeight: '13rem',
    overflowY: 'auto',
    padding: '0.25rem',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 10px)',
    background: 'var(--color-bg, #ffffff)',
    boxShadow: '0 10px 30px -12px rgba(15, 23, 42, 0.35)',
  }
}

export function tagSuggestionItemStyle(active) {
  return {
    display: 'block',
    width: '100%',
    padding: '0.4rem 0.55rem',
    fontSize: '14px',
    textAlign: 'left',
    border: 0,
    borderRadius: 'calc(var(--radius, 8px) - 2px)',
    background: active ? 'color-mix(in srgb, var(--color-primary, #2563eb) 12%, transparent)' : 'transparent',
    color: 'var(--color-text, #0f172a)',
    cursor: 'pointer',
  }
}

export const tagEmptyStyle = () => ({ padding: '0.5rem 0.55rem', fontSize: '14px', color: 'var(--color-muted, #64748b)' })

// Suggestions that are (a) not already selected and (b) match the query. Pure, so react + vue share it.
export function filterSuggestions(suggestions, selected, query) {
  const q = normalizeQuery(query)
  const chosen = new Set(selected)
  return suggestions.filter((s) => !chosen.has(s) && (!q || String(s).toLowerCase().includes(q)))
}

// The static <style> for the interactive states: a focus-within ring on the field, hover tints on the
// remove button + suggestion rows, and a dimmed disabled field.
export const TAG_INPUT_STYLE_TAG =
  '.vike-blocks-taginput:focus-within{outline:none;border-color:var(--color-ring,var(--color-primary,#2563eb));box-shadow:0 0 0 2px color-mix(in srgb,var(--color-ring,var(--color-primary,#2563eb)) 30%,transparent)}' +
  '.vike-blocks-tagremove:hover{background:color-mix(in srgb,var(--color-muted,#64748b) 20%,transparent);color:var(--color-text,#0f172a)}' +
  '.vike-blocks-tagsuggest:hover{background:color-mix(in srgb,var(--color-muted,#64748b) 12%,transparent)}'
