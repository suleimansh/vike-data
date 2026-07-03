// The React renderer for the `combobox` block — a dep-free, theme-native searchable single-select.
// Reuses the popover primitive (anchor + outside-click + Escape + open-gated SSR); the panel holds a
// search input that filters the options and a role="listbox" of role="option" rows with arrow-key +
// Enter selection. Tracks its own open / query / selection state, so SSR renders only the trigger (no
// hydration mismatch). A hidden input carries the selected value for a plain form POST (submit is the
// actions axis #385). The trigger / search / rows come from the shared combobox-styles module, so this
// can't drift from the Vue twin.
import { useState, useMemo } from 'react'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.jsx'
import { popoverSurfaceStyle, popoverMotionStyle } from '../popover-styles.js'
import {
  comboboxTriggerStyle,
  comboboxPlaceholderStyle,
  comboboxSearchStyle,
  comboboxListStyle,
  comboboxItemStyle,
  comboboxEmptyStyle,
  COMBOBOX_STYLE_TAG,
  filterOptions,
} from '../combobox-styles.js'

export function ComboboxView({ options = [], value = null, placeholder = 'Select...', searchPlaceholder = 'Search...', empty = 'No results.', name, disabled = false }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(value)
  const [active, setActive] = useState(0)
  const selectedOption = options.find((o) => o.value === selected) || null
  const filtered = useMemo(() => filterOptions(options, query), [options, query])

  const choose = (opt) => {
    setSelected(opt.value)
    setOpen(false)
    setQuery('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[active]
      if (opt) choose(opt)
    }
  }

  const trigger = (
    <>
      <style>{COMBOBOX_STYLE_TAG}</style>
      <button
        type="button"
        className="vike-blocks-combobox-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        style={comboboxTriggerStyle(disabled)}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={selectedOption ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : comboboxPlaceholderStyle()}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span aria-hidden="true" style={{ fontSize: 11, color: 'var(--color-muted, #64748b)' }}>
          {'▾'}
        </span>
      </button>
    </>
  )

  return (
    <>
      {name != null && <input type="hidden" name={name} value={selected ?? ''} readOnly />}
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        trigger={trigger}
        placement="bottom-start"
        role="listbox"
        panelStyle={(v, pl) => ({ ...popoverSurfaceStyle(), ...popoverMotionStyle(v, pl), minWidth: '14rem' })}
      >
        <div data-slot="combobox" onKeyDown={onKeyDown}>
          <input
            className="vike-blocks-combobox-search"
            data-slot="combobox-input"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            style={comboboxSearchStyle()}
          />
          <div role="listbox" style={comboboxListStyle()}>
            {filtered.length === 0 ? (
              <div style={comboboxEmptyStyle()}>{empty}</div>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  aria-selected={opt.value === selected}
                  data-active={i === active ? 'true' : undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(opt)}
                  style={comboboxItemStyle(i === active, opt.value === selected)}
                >
                  <span>{opt.label}</span>
                  {opt.value === selected && <span aria-hidden="true">{'✓'}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      </Popover>
    </>
  )
}

registerBlockRenderer('combobox', ComboboxView)
