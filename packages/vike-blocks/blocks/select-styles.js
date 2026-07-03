// Shared, framework-agnostic style data for the `select` block, imported by BOTH the react and vue
// renderers so the surface can't drift. Theme-native reimplementation of the shadcn Base native-select:
// a real <select> with the browser chevron stripped (appearance:none) and our own chevron drawn in a
// relative wrapper. Every color reads a vike-themes CSS var (with a fallback). The focus ring /
// disabled / placeholder-tint states can't be inline, so the element carries a `vike-blocks-select`
// class + SELECT_STYLE_TAG (a static, identical-everywhere <style>) — dep-free, SSR-safe.

// The relative wrapper the chevron is absolutely positioned within.
export const selectWrapStyle = () => ({ position: 'relative', display: 'block', width: '100%' })

// The <select> box: mirrors the input box, with right padding reserved for the chevron and the native
// arrow removed so ours shows through.
export function selectStyle(disabled) {
  return {
    display: 'block',
    width: '100%',
    height: '2.25rem',
    padding: '0 2rem 0 0.75rem',
    fontSize: '14px',
    fontFamily: 'inherit',
    lineHeight: 1,
    color: 'var(--color-text, #0f172a)',
    background: 'var(--color-bg, #ffffff)',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 8px)',
    boxSizing: 'border-box',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: disabled ? 'default' : 'pointer',
  }
}

// The SVG chevron (shadcn/lucide chevron-down) drawn in the right-edge slot, stroked in currentColor.
export const CHEVRON_DOWN_PATH = 'm6 9 6 6 6-6'

// The chevron slot overlaid at the right edge (pointer-events off so clicks fall through to the select).
export const selectChevronStyle = () => ({
  position: 'absolute',
  right: '0.6rem',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'inline-flex',
  lineHeight: 0,
  pointerEvents: 'none',
  color: 'var(--color-muted, #64748b)',
})

// The static <style> for the interactive states (identical for every select, so duplicate tags collapse
// to one effect): a focus-visible ring, a dimmed disabled surface, and a muted tint while the empty
// placeholder choice is selected (`data-placeholder="true"`).
export const SELECT_STYLE_TAG =
  '.vike-blocks-select{transition:border-color .15s ease,box-shadow .15s ease}' +
  '.vike-blocks-select:focus-visible{border-color:var(--color-ring,var(--color-primary,#2563eb));box-shadow:0 0 0 3px color-mix(in srgb,var(--color-ring,var(--color-primary,#2563eb)) 25%,transparent)}' +
  '.vike-blocks-select:disabled{opacity:.5;cursor:default;background:var(--color-surface,#f1f5f9)}' +
  '.vike-blocks-select[data-placeholder="true"]{color:var(--color-muted,#94a3b8)}'
