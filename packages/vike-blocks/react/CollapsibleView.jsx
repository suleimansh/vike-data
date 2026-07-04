// The React renderer for the `collapsible` block — a single expand/collapse disclosure, the
// single-panel sibling of the accordion. Theme-native (vike-themes CSS vars), with the same
// zero-dependency height morph + fade the accordion uses: the panel measures its natural height and
// CSS-transitions between 0 and that height (auto isn't animatable), the inner div always rendered so
// it can be measured while collapsed. Open/closed is local UI state; the panel's resolved blocks are
// drawn with <Blocks>.
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'

// Measure before paint on the client; no-op (no warning) during SSR.
const useIsoLayout = typeof document !== 'undefined' ? useLayoutEffect : useEffect

// A rotating chevron, drawn from the current color so it inherits the trigger's text color.
function Chevron({ open }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function CollapsibleView({ label = '', open: initialOpen = false, sections = [] }) {
  const [open, setOpen] = useState(initialOpen)
  const contentRef = useRef(null)
  const [height, setHeight] = useState(initialOpen ? undefined : 0)
  useIsoLayout(() => {
    if (contentRef.current) setHeight(open ? contentRef.current.offsetHeight : 0)
  }, [open])

  return (
    <div
      data-slot="collapsible"
      style={{ margin: '0.75rem 0', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 'var(--radius, 8px)', overflow: 'hidden' }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: '0.75rem',
          padding: '0.75rem 0.9rem',
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 15,
          fontWeight: 600,
          textAlign: 'left',
          color: 'var(--color-text, #0f172a)',
        }}
      >
        <span>{label}</span>
        <Chevron open={open} />
      </button>
      <div style={{ overflow: 'hidden', transition: 'height 0.28s ease', height: height != null ? height : 'auto' }}>
        <div
          ref={contentRef}
          role="region"
          style={{ opacity: open ? 1 : 0, transition: 'opacity 0.28s ease', padding: '0 0.9rem 0.85rem' }}
        >
          <Blocks sections={sections} />
        </div>
      </div>
    </div>
  )
}

registerBlockRenderer('collapsible', CollapsibleView)
