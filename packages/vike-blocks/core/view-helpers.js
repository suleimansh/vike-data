// Small framework-agnostic helpers shared by the react + vue view twins for blocks that have no
// dedicated *-styles module (slot, layout), so the pure logic lives once instead of per framework.

// True when a config value is a nav-item list (an array of { href | label } objects) — the SlotView
// discriminant for rendering a nav region vs a raw value.
export const isNav = (v) =>
  Array.isArray(v) && v.every((i) => i && typeof i === 'object' && ('href' in i || 'label' in i))

// The stable region order for the neutral stack layout: header, main, footer first (only when
// present), then any extra regions in declaration order.
export function stackRegionOrder(slots) {
  const known = ['header', 'main', 'footer']
  return [...known.filter((n) => slots[n]), ...Object.keys(slots).filter((n) => !known.includes(n))]
}
