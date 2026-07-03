// Shared, framework-agnostic style data for the `tooltip` block, imported by BOTH the react and vue
// renderers so the surface can't drift. Dep-free reimplementation of shadcn's Radix tooltip: instead of
// a portal + JS positioning, the tip is a `position:absolute` child of a `position:relative` wrapper,
// revealed PURELY WITH CSS on `:hover` / `:focus-within` — so it needs no client JS, no state, and SSR
// renders the final markup (no hydration concern). A dark surface with a small rotated-square arrow,
// theme-native via `var(--color-*)`. The whole interaction lives in the static TOOLTIP_STYLE_TAG.

// The wrapper is inline so it sits with the trigger; the trigger content is provided by the block.
export const tooltipWrapStyle = () => ({ position: 'relative', display: 'inline-flex' })

// The default trigger when the block wraps no block of its own — a small focusable "?" info marker
// (focusable so `:focus-within` reveals the tip for keyboard users too).
export const tooltipMarkerStyle = () => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.15rem',
  height: '1.15rem',
  padding: 0,
  borderRadius: '999px',
  border: '1px solid var(--color-border, #cbd5e1)',
  background: 'var(--color-surface, #f1f5f9)',
  color: 'var(--color-muted, #64748b)',
  font: 'inherit',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'help',
})

// The static <style> that positions + reveals the tip. Placement rides a `data-side` attribute; the tip
// starts hidden + slightly offset and settles into place on hover / focus-within with a fade + scale.
export const TOOLTIP_STYLE_TAG =
  '.vike-blocks-tooltip{position:relative;display:inline-flex}' +
  '.vike-blocks-tooltip-tip{position:absolute;z-index:50;white-space:nowrap;pointer-events:none;padding:0.3rem 0.55rem;font-size:12px;line-height:1.3;border-radius:6px;' +
  'background:var(--color-tooltip-bg,var(--color-text,#0f172a));color:var(--color-tooltip-text,var(--color-bg,#ffffff));box-shadow:0 4px 12px rgba(0,0,0,0.18);opacity:0;transition:opacity .14s ease,transform .14s ease}' +
  // hidden "from" position per side
  '.vike-blocks-tooltip-tip[data-side="top"]{bottom:100%;left:50%;margin-bottom:7px;transform:translate(-50%,4px) scale(.96)}' +
  '.vike-blocks-tooltip-tip[data-side="bottom"]{top:100%;left:50%;margin-top:7px;transform:translate(-50%,-4px) scale(.96)}' +
  '.vike-blocks-tooltip-tip[data-side="left"]{right:100%;top:50%;margin-right:7px;transform:translate(4px,-50%) scale(.96)}' +
  '.vike-blocks-tooltip-tip[data-side="right"]{left:100%;top:50%;margin-left:7px;transform:translate(-4px,-50%) scale(.96)}' +
  // reveal on hover / keyboard focus, settling into place
  '.vike-blocks-tooltip:hover .vike-blocks-tooltip-tip,.vike-blocks-tooltip:focus-within .vike-blocks-tooltip-tip{opacity:1}' +
  '.vike-blocks-tooltip:hover .vike-blocks-tooltip-tip[data-side="top"],.vike-blocks-tooltip:focus-within .vike-blocks-tooltip-tip[data-side="top"]{transform:translate(-50%,0) scale(1)}' +
  '.vike-blocks-tooltip:hover .vike-blocks-tooltip-tip[data-side="bottom"],.vike-blocks-tooltip:focus-within .vike-blocks-tooltip-tip[data-side="bottom"]{transform:translate(-50%,0) scale(1)}' +
  '.vike-blocks-tooltip:hover .vike-blocks-tooltip-tip[data-side="left"],.vike-blocks-tooltip:focus-within .vike-blocks-tooltip-tip[data-side="left"]{transform:translate(0,-50%) scale(1)}' +
  '.vike-blocks-tooltip:hover .vike-blocks-tooltip-tip[data-side="right"],.vike-blocks-tooltip:focus-within .vike-blocks-tooltip-tip[data-side="right"]{transform:translate(0,-50%) scale(1)}' +
  // the rotated-square arrow, inheriting the tip surface
  '.vike-blocks-tooltip-arrow{position:absolute;width:8px;height:8px;background:inherit;transform:rotate(45deg)}' +
  '.vike-blocks-tooltip-tip[data-side="top"] .vike-blocks-tooltip-arrow{bottom:-3px;left:50%;margin-left:-4px}' +
  '.vike-blocks-tooltip-tip[data-side="bottom"] .vike-blocks-tooltip-arrow{top:-3px;left:50%;margin-left:-4px}' +
  '.vike-blocks-tooltip-tip[data-side="left"] .vike-blocks-tooltip-arrow{right:-3px;top:50%;margin-top:-4px}' +
  '.vike-blocks-tooltip-tip[data-side="right"] .vike-blocks-tooltip-arrow{left:-3px;top:50%;margin-top:-4px}'
