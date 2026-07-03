// The single, framework-agnostic motion source for the overlay family (dialog / sheet / drawer). One
// duration + one easing curve, imported by the react + vue overlay primitives AND by sheet-styles /
// drawer-styles / the dialog, so the four surfaces animate identically and can't drift apart. The curve
// is a decelerate ease with NO overshoot (Vaul / Radix feel): a full-edge panel that overshot would
// flash a gap past its edge, and a modal that bounces reads as a toy — so every overlay settles cleanly.
export const OVERLAY_ENTER_MS = 260 // enter + exit; the primitive keeps the panel mounted this long on close
export const OVERLAY_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)' // decelerate, no overshoot — the shared panel curve
export const OVERLAY_BACKDROP_EASE = 'ease-out' // the backdrop fade, matched to the panel's duration

// The tab-order selector for the elements an overlay/popover focuses on open. One string, shared by
// the react + vue overlay primitives and the popover primitive, so the focus set can't drift.
export const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
