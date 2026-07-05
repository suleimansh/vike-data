// Shared, framework-agnostic styling + timing for the `toast` block, imported by BOTH the store (for
// the exit timing) and the react/vue Toaster regions (so the twins can't drift). Intents reuse the
// alert block's vocabulary (success / error->danger / warning / info) so a toast matches an alert;
// a neutral toast (no intent) shows no accent icon. Theme-native: every color is a vike-themes CSS var.
//
// The Toaster is a Sonner-style DECK: within one corner, toasts stack on top of each other, pinned to
// the region's edge. Collapsed (default) the ones behind the front peek out — offset by a small gap,
// scaled down, the deepest ones hidden past `TOAST_VISIBLE`. On hover the deck EXPANDS: each toast
// slides to sit above the previous by its own measured height, all at full scale — a readable list.
// The per-toast layout math (offset / scale / z / opacity) lives here so the two renderers stay thin;
// they only measure heights and toggle `expanded`.
import { INTENTS, intentKey } from './alert-styles.js'

export const TOAST_ENTER_MS = 300
export const TOAST_EXIT_MS = 200
export const TOAST_POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']
export const TOAST_WIDTH = 356 // Sonner's toast width, in px
export const TOAST_GAP = 14 // px between toasts when expanded, and the collapsed peek per level
export const TOAST_VISIBLE = 3 // how many toasts show at once before the rest hide behind the deck

// The cumulative height (+`gap`) of the toasts stacked in FRONT of each one (its distance from the
// edge), by the deck's front-to-back order. Pure prefix-sum shared by both renderers so the collapsed
// deck geometry can't drift. `hOf(t)` returns a toast's measured height.
export function toastDeckOffsets(ordered, hOf, gap) {
  const inFront = []
  let acc = 0
  for (const t of ordered) {
    inFront.push(acc)
    acc += hOf(t) + gap
  }
  return inFront
}
const SCALE_STEP = 0.05 // each toast behind the front shrinks by this much when collapsed
const ENTER_SHIFT = 22 // px a toast slides from its edge on enter / to its edge on exit
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// Resolve a toast intent to its accent + icon. Neutral (undefined / 'default' / 'message') has no icon;
// otherwise defer to the alert block's intentKey (so 'error' aliases to danger, etc.).
export function resolveToastIntent(intent) {
  if (intent == null || intent === 'default' || intent === 'message') return { accent: null, icon: null }
  const it = INTENTS[intentKey(intent)]
  return { accent: it.accent, icon: it.icon }
}

// The fixed corner region that holds one position's deck. Toasts inside are absolutely pinned to the
// region's edge; `height` (measured extent of the deck, collapsed or expanded) sizes the hover target
// and reserves the space, transitioning as the deck grows/shrinks.
export function toastRegionStyle(position, height) {
  const [side, align] = position.split('-')
  const style = {
    position: 'fixed',
    zIndex: 60,
    width: `${TOAST_WIDTH}px`,
    maxWidth: 'calc(100vw - 2rem)',
    height: `${Math.max(0, height)}px`,
    transition: `height ${TOAST_ENTER_MS}ms ${EASE}`,
  }
  style[side] = '1rem'
  if (align === 'center') {
    style.left = '50%'
    style.transform = 'translateX(-50%)'
  } else {
    style[align] = '1rem'
  }
  return style
}

// Swipe-to-dismiss (Sonner's flick). A toast can be dragged toward its region edge to close it: past
// TOAST_SWIPE_THRESHOLD px it flicks away, a shorter drag snaps back. Vertical only — a bottom deck
// dismisses on a downward drag, a top deck on an upward one (the axis the deck is anchored on). Same
// displacement-threshold model as the drawer's grabber (drawer-styles), kept in the toast's own module
// so the two blocks stay decoupled and the toast can fade as it goes. Both renderers share these pure
// helpers so the twins can't drift; they only track the pointer and feed the offset back in as `drag`.
export const TOAST_SWIPE_THRESHOLD = 45 // px toward the edge that dismisses; a shorter drag snaps back

// The distance dragged toward the edge (the dismiss direction), never negative — dragging away is inert.
export function toastSwipeOffset(side, dy) {
  return side === 'top' ? Math.max(0, -dy) : Math.max(0, dy)
}

// Whether releasing at this offset dismisses (crossed the threshold) vs snaps back.
export const toastShouldDismiss = (offset, threshold = TOAST_SWIPE_THRESHOLD) => offset >= threshold

// The toast fades as it is swiped: full at rest, ~half at the threshold, gone by twice it.
export const toastSwipeFade = (offset, threshold = TOAST_SWIPE_THRESHOLD) => Math.max(0, 1 - offset / (threshold * 2))

// The positioned transform for one toast in the deck. `index` is its depth (0 = front / newest);
// `heightsInFront` is the summed height (+gap) of the toasts closer to the edge, used to spread the
// expanded list; `hidden` drops the ones past TOAST_VISIBLE when collapsed; `show` gates the enter
// (false on mount, flipped true after a frame) and the exit (false once the store marks it dismissed).
// `drag` (px) is the live swipe offset toward the edge: it follows the finger and suppresses the easing
// while the pointer is down, and fades the toast as it goes.
export function toastStackStyle({ index, total, side, expanded, heightsInFront, hidden, show, drag = 0 }) {
  const dir = side === 'top' ? 1 : -1 // bottom decks stack upward (negative Y), top decks downward
  const baseY = expanded ? dir * heightsInFront : dir * index * TOAST_GAP
  const scale = expanded ? 1 : Math.max(0.9, 1 - index * SCALE_STEP)
  const enterY = show ? 0 : -dir * ENTER_SHIFT // slide in from / out toward the region edge
  const swipeY = -dir * drag // follow the finger toward the edge (the exit direction)
  const dragging = drag > 0
  return {
    position: 'absolute',
    [side]: 0,
    left: 0,
    right: 0,
    boxSizing: 'border-box',
    transformOrigin: side, // pin the anchored edge while scaling
    transform: `translateY(${baseY + enterY + swipeY}px) scale(${scale})`,
    zIndex: total - index,
    opacity: (show && !hidden ? 1 : 0) * (dragging ? toastSwipeFade(drag) : 1),
    transition: dragging ? 'none' : `transform ${TOAST_ENTER_MS}ms ${EASE}, opacity ${TOAST_ENTER_MS}ms ease`,
  }
}

// The extent (px) the region reserves: collapsed = the front toast plus a peek per stacked level;
// expanded = the full spread of every visible toast. `heights` is newest-first (front at index 0).
export function toastDeckExtent(heights, expanded) {
  const n = heights.length
  if (n === 0) return 0
  if (expanded) return heights.reduce((sum, h) => sum + h, 0) + (n - 1) * TOAST_GAP
  const visible = Math.min(n, TOAST_VISIBLE)
  return heights[0] + (visible - 1) * TOAST_GAP
}

// The card box (border, surface, shadow, padding) — the motion lives in toastStackStyle, so this is
// just the look. An intent tints the border slightly.
export function toastCardStyle(intent) {
  const { accent } = resolveToastIntent(intent)
  return {
    pointerEvents: 'auto',
    touchAction: 'none', // the card is a swipe surface — keep touch drags from scrolling the page
    userSelect: 'none', // ...and a mouse drag from selecting the toast text instead of swiping
    WebkitUserSelect: 'none',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.8rem 0.9rem',
    border: `1px solid ${accent ? `color-mix(in srgb, ${accent} 35%, var(--color-border, #e2e8f0))` : 'var(--color-border, #e2e8f0)'}`,
    borderRadius: 'var(--radius, 12px)',
    background: 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #0f172a)',
    boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.18), 0 2px 4px -2px rgba(15, 23, 42, 0.12)',
    font: 'inherit',
    fontSize: '14px',
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
