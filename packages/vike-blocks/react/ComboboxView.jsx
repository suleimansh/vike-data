// The React renderer for the `combobox` block — a dep-free, theme-native searchable single-select that
// is INPUT-ANCHORED: the trigger IS the search input, so you type in place to filter and the list opens
// directly below. Reuses the popover primitive (anchor + outside-click + Escape + open-gated SSR) for
// the floating list only. Options are non-focusable role="option" divs, so focus stays in the input
// while you arrow through them (selection via arrow-key + Enter, or click). Tracks its own open / query
// / selection state, so SSR renders only the input (no hydration mismatch). A hidden input carries the
// selected value for a plain form POST (submit is the actions axis #385). The input / rows / chevron
// come from the shared combobox-styles module, so this can't drift from the Vue twin.
import { useState, useMemo } from 'react'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.jsx'
import { popoverSurfaceStyle, popoverMotionStyle } from '../popover-styles.js'
import {
  comboboxWrapStyle,
  comboboxInputStyle,
  comboboxChevronStyle,
  comboboxListStyle,
  comboboxItemStyle,
  comboboxEmptyStyle,
  CHEVRON_DOWN_PATH,
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

  const openList = () => {
    if (disabled || open) return
    setOpen(true)
    setQuery('')
    setActive(0)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) return openList()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && open) {
      e.preventDefault()
      const opt = filtered[active]
      if (opt) choose(opt)
    }
  }

  // While open the input shows the live query; closed, it shows the selected label. The placeholder
  // switches to the search hint while open.
  const inputValue = open ? query : selectedOption?.label ?? ''

  const trigger = (
    <span style={comboboxWrapStyle()}>
      <style>{COMBOBOX_STYLE_TAG}</style>
      <input
        className="vike-blocks-combobox-input"
        data-slot="combobox-input"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        disabled={disabled}
        value={inputValue}
        placeholder={open ? searchPlaceholder : placeholder}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          if (!open) setOpen(true)
        }}
        onMouseDown={openList}
        onFocus={openList}
        onKeyDown={onKeyDown}
        style={comboboxInputStyle(disabled)}
      />
      <span aria-hidden="true" style={comboboxChevronStyle()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={CHEVRON_DOWN_PATH} />
        </svg>
      </span>
    </span>
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
        <div role="listbox" data-slot="combobox" style={comboboxListStyle()}>
          {filtered.length === 0 ? (
            <div style={comboboxEmptyStyle()}>{empty}</div>
          ) : (
            filtered.map((opt, i) => (
              <div
                key={String(opt.value)}
                role="option"
                aria-selected={opt.value === selected}
                data-active={i === active ? 'true' : undefined}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault() // keep focus in the input; select on press
                  choose(opt)
                }}
                style={comboboxItemStyle(i === active, opt.value === selected)}
              >
                <span>{opt.label}</span>
                {opt.value === selected && <span aria-hidden="true">{'✓'}</span>}
              </div>
            ))
          )}
        </div>
      </Popover>
    </>
  )
}

registerBlockRenderer('combobox', ComboboxView)
