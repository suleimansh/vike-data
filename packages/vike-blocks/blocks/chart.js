// The `chart` block — a minimal, dep-free data chart (bar / line / area), defined through the
// defineBlock seam. `chart(data)` takes a single series: an array of `{ label, value }` (or bare
// numbers). `.type('bar'|'line'|'area')` picks the form (default bar); `.height(px)` sizes the plot;
// `.color(css)` sets the accent; `.max(n)` fixes the y-scale (else it's derived from the data). The
// geometry (scaling + the SVG path math) is a pure, tested module the renderers share, so this stays a
// declarative IR — a real charting engine is heavy, so the long tail (rich/interactive charts) drops to
// a `custom` block that plugs in a chart library. Pie/donut is a follow-up.
//
//   chart([{ label: 'Mon', value: 12 }, { label: 'Tue', value: 18 }])
//   chart([4, 8, 15, 16, 23, 42]).type('line')
//   chart(revenue).type('area').height(200).color('var(--color-success)')
import { defineBlock } from '../core/registry.js'

const TYPES = new Set(['bar', 'line', 'area'])

export const chart = defineBlock('chart', {
  category: 'data',
  summary: "A simple bar / line / area chart from data points.",
  example: "chart([{ label: 'Mon', value: 12 }, { label: 'Tue', value: 18 }]).type('line')",
  build: (data) => ({ data: Array.isArray(data) ? data : [] }),
  refine: {
    type: (t) => ({ type: TYPES.has(t) ? t : 'bar' }),
    height: (h) => ({ height: h }),
    color: (c) => ({ color: c }),
    max: (m) => ({ max: m }),
  },
})
