// Shared, framework-agnostic styling + timing for the `toast` block, imported by BOTH the store (for
// the exit timing) and the react/vue Toaster regions (so the twins can't drift). Intents reuse the
// alert block's vocabulary (success / error->danger / warning / info) so a toast matches an alert;
// a neutral toast (no intent) shows no accent icon. Theme-native: every color is a vike-themes CSS var.
import { INTENTS, intentKey } from './alert-styles.js'

export const TOAST_ENTER_MS = 220
export const TOAST_EXIT_MS = 200
export const TOAST_POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']

// Resolve a toast intent to its accent + icon. Neutral (undefined / 'default' / 'message') has no icon;
// otherwise defer to the alert block's intentKey (so 'error' aliases to danger, etc.).
export function resolveToastIntent(intent) {
  if (intent == null || intent === 'default' || intent === 'message') return { accent: null, icon: null }
  const it = INTENTS[intentKey(intent)]
  return { accent: it.accent, icon: it.icon }
}

// The fixed corner region that stacks one position's toasts. Bottom positions stack newest nearest the
// edge (column-reverse). The container ignores pointer events; the cards re-enable them.
export function toastRegionStyle(position) {
  const [side, align] = position.split('-')
  const style = {
    position: 'fixed',
    zIndex: 60,
    display: 'flex',
    flexDirection: side === 'bottom' ? 'column-reverse' : 'column',
    gap: '0.6rem',
    padding: '1rem',
    maxWidth: '100vw',
    pointerEvents: 'none',
  }
  style[side] = 0
  if (align === 'center') {
    style.left = '50%'
    style.transform = 'translateX(-50%)'
    style.alignItems = 'center'
  } else {
    style[align] = 0
    style.alignItems = align === 'right' ? 'flex-end' : 'flex-start'
  }
  return style
}

// The hidden-frame transform a card enters from / exits to, based on its region edge: center positions
// slide vertically from their edge, side positions slide horizontally off their edge.
function offscreenTransform(position) {
  const [side, align] = position.split('-')
  if (align === 'center') return side === 'top' ? 'translateY(-16px)' : 'translateY(16px)'
  return align === 'right' ? 'translateX(16px)' : 'translateX(-16px)'
}

// One toast card. `show` drives the enter (false on mount, flipped true after a reflow) and the exit
// (flipped false when the store marks the toast dismissed). `intent` colors the accent icon.
export function toastCardStyle(intent, { show, position }) {
  const { accent } = resolveToastIntent(intent)
  return {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    width: '20rem',
    maxWidth: 'calc(100vw - 2rem)',
    boxSizing: 'border-box',
    padding: '0.75rem 0.85rem',
    border: `1px solid ${accent ? `color-mix(in srgb, ${accent} 35%, var(--color-border, #e2e8f0))` : 'var(--color-border, #e2e8f0)'}`,
    borderRadius: 'var(--radius, 10px)',
    background: 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #0f172a)',
    boxShadow: '0 10px 30px -12px rgba(15, 23, 42, 0.35)',
    font: 'inherit',
    fontSize: '14px',
    opacity: show ? 1 : 0,
    transform: show ? 'translate(0, 0)' : offscreenTransform(position),
    transition: `opacity ${TOAST_ENTER_MS}ms ease, transform ${TOAST_ENTER_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
  }
}

export const toastIconStyle = (intent) => ({ flexShrink: 0, fontSize: '15px', fontWeight: 700, lineHeight: 1.5, color: resolveToastIntent(intent).accent ?? 'var(--color-muted, #64748b)' })
export const toastTitleStyle = () => ({ fontWeight: 500, lineHeight: 1.45 })
export const toastDescStyle = () => ({ marginTop: '0.15rem', fontSize: '13px', color: 'var(--color-muted, #64748b)', lineHeight: 1.4 })

export function toastCloseStyle() {
  return {
    flexShrink: 0,
    marginLeft: 'auto',
    width: '1.4rem',
    height: '1.4rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 0,
    borderRadius: '999px',
    background: 'transparent',
    color: 'var(--color-muted, #64748b)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '15px',
    lineHeight: 1,
  }
}

export const TOAST_STYLE_TAG = '.vike-blocks-toast-close:hover{background:var(--color-surface,#f1f5f9);color:var(--color-text,#0f172a)}'
