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

// The two enter motions the centered-modal panels use. `tilt` (dialog/confirm): a blur + perspective
// flip-in from the top. `lift` (command): a scale + upward translate, no blur. Both settle on the
// shared curves so nothing drifts.
const OVERLAY_PANEL_MOTION = {
  tilt: (visible) => ({
    filter: visible ? 'blur(0px)' : 'blur(3px)',
    transform: visible ? 'perspective(500px) rotateX(0deg) scale(1)' : 'perspective(500px) rotateX(-12deg) scale(0.95)',
    transition: `opacity ${OVERLAY_ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}, filter ${OVERLAY_ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}, transform ${OVERLAY_ENTER_MS}ms ${OVERLAY_EASE}`,
  }),
  lift: (visible) => ({
    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(-8px)',
    transition: `opacity ${OVERLAY_ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}, transform ${OVERLAY_ENTER_MS}ms ${OVERLAY_EASE}`,
  }),
}

// The centered-modal panel surface shared by the dialog / confirm / command overlays: one theme-native
// box (bg / color / radius / shadow) plus one of the two motions above, so the three blocks and their
// react/vue twins can't drift. Emits px STRINGS (Vue's `h()` has no auto-px); React renders them
// identically to the unitless numbers it used to auto-suffix. Per-block bits are params: `maxWidth`,
// the `motion` variant, the `padding` (command passes null — its inner sections own the inset — plus
// `overflow: 'hidden'` to clip the rounded corners). Key order matches the old inline objects so the
// SSR output is byte-identical.
export function overlayPanelStyle(visible, { maxWidth, motion = 'tilt', padding = '1.25rem', overflow } = {}) {
  return {
    width: '100%',
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    ...(padding ? { padding } : {}),
    background: 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #0f172a)',
    borderRadius: 'var(--radius, 12px)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
    ...(overflow ? { overflow } : {}),
    opacity: visible ? 1 : 0,
    ...OVERLAY_PANEL_MOTION[motion](visible),
  }
}
