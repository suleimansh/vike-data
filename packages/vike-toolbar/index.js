// vike-toolbar — the framework-agnostic CORE.
//
// The toolbar is one fixed logo button + a popover that OTHER extensions drop simple
// settings into: a theme toggle, a locale switcher, an account link. The composition
// is the same cumulative-seam pattern the rest of the Stem set uses (`nav`, `themes`,
// `messages`, `adminResources`, `permissions`): an extension advertises a `toolbarItems`
// entry, every installed extension's entries compose, and the per-framework UI renders
// them. So installing an extension brings its settings into the popover with no toolbar
// wiring beyond the cumulative key.
//
// Zero framework imports here — this is just the item shape + the merge. The per-framework
// UI (the button, the popover, rendering each item's control, and the `useToolbarSlot`
// hook a live control uses to find the popover) lives in vike-toolbar/react and
// vike-toolbar/vue.

// The DOM-id contract this package OWNS. Other extensions (vike-themes, vike-i18n) target
// these same nodes from their own framework's portal/teleport to drop a live control into
// the shared popover. They are exported as the canonical source so consumers import them
// instead of re-hardcoding the literals (the `useToolbarSlot` hooks in vike-toolbar/react
// and /vue read them, so no extension re-declares its own copy).
// These are a CONSUMED CONTRACT: the string VALUES must never change.
export const TOOLBAR_ROOT_ID = 'vike-toolbar-root' // the out-of-hydration mount node
export const TOOLBAR_ITEMS_ID = 'vike-toolbar-items' // the in-popover teleport target

// Namespaced prefix for auto-assigned render ids (see allToolbarItems). Kept distinct from
// anything an app would plausibly type as an explicit `id` (e.g. `item-3`) so a fabricated
// fallback can never collide with a real id and produce duplicate React keys.
const AUTO_ID_PREFIX = 'vike-toolbar-item-'

/**
 * A single toolbar entry contributed to the cumulative `toolbarItems` registry.
 * @typedef {Object} ToolbarItem
 * @property {string} [id] Stable identifier. Dedupes by EXPLICIT id (first wins); omit to
 *   always survive composition — a unique render id is then assigned by final position.
 * @property {string} [label] Optional text shown beside the control in the popover.
 * @property {number} [order] Sort key in the popover, ascending (default 0); ties keep
 *   contribution order.
 * @property {Function} Control Per-framework control component. REQUIRED — an entry without
 *   it is dropped (with a dev warning).
 */

/**
 * Declare an extension's toolbar items for the cumulative `toolbarItems` registry.
 * Plain passthrough that fills defaults + drops malformed entries, so a contributor
 * writes `toolbarItems: defineToolbarItems([...])` and the composed list is uniform.
 * @param {ToolbarItem | ToolbarItem[]} [items] One item or a list of them.
 * @returns {ToolbarItem[]} Normalized items ({ id, label, order, Control }).
 */
export function defineToolbarItems(items = []) {
  // Leave `id` null when the author didn't set one — do NOT fabricate `item-${i}` here.
  // The index is local to THIS contribution, so two id-less extensions would both produce
  // `item-0`, and allToolbarItems (dedupe by id) would drop the second as a "duplicate".
  // A globally-unique fallback can only be assigned after flattening (see allToolbarItems).
  const list = Array.isArray(items) ? items : [items]
  const out = []
  for (const it of list) {
    if (!it) continue
    if (!it.Control) {
      // A control-less entry can't render — drop it, but say so in dev so a contributor
      // isn't left wondering why their item vanished from the popover.
      if (isDev())
        console.warn(
          `[vike-toolbar] dropped toolbar item ${it.id ? `"${it.id}"` : '(no id)'}: missing \`Control\`.`,
        )
      continue
    }
    out.push({
      id: it.id ?? null,
      label: it.label ?? null,
      order: Number.isFinite(it.order) ? it.order : 0,
      Control: it.Control,
    })
  }
  return out
}

/**
 * Flatten the cumulative registry (array of per-source arrays) into the ordered list the
 * popover renders: drops falsy/control-less entries, de-dupes by EXPLICIT `id` only (first
 * wins, so an app can't accidentally double a deliberately-identified item), sorts by
 * `order` (stable), then assigns each surviving item a unique render id. Auto (null) ids
 * never dedupe against each other, so every contributed item survives.
 * @param {Array<ToolbarItem[]>} contributions Per-source arrays from the cumulative registry.
 * @returns {ToolbarItem[]} Ordered items, each with a guaranteed-unique `id`.
 */
export function allToolbarItems(contributions) {
  const flat = (contributions || []).flat().filter((it) => it && it.Control)
  const seen = new Set()
  const unique = []
  for (const it of flat) {
    const id = it.id ?? null
    if (id != null && seen.has(id)) continue
    if (id != null) seen.add(id)
    unique.push(it)
  }
  // Stable sort by order: decorate with the original index so equal orders keep their
  // contribution sequence (Array#sort is not guaranteed stable for all engines/inputs).
  // Then fill a unique fallback id by FINAL position, namespaced so it can't collide with
  // an explicit id (and, defensively, bumped if an app literally used the namespaced form).
  return unique
    .map((it, i) => ({ it, i, order: Number.isFinite(it.order) ? it.order : 0 }))
    .sort((a, b) => a.order - b.order || a.i - b.i)
    .map((x, i) => {
      if (x.it.id != null) return { ...x.it, id: x.it.id }
      let id = `${AUTO_ID_PREFIX}${i}`
      while (seen.has(id)) id = `${id}-` // pathological: app used the namespaced string
      seen.add(id)
      return { ...x.it, id }
    })
}

// True outside a production build. Guards dev-only warnings so they never ship to prod
// bundles (bundlers dead-code-eliminate the `process.env.NODE_ENV === 'production'` branch).
function isDev() {
  return typeof process === 'undefined' || process.env.NODE_ENV !== 'production'
}
