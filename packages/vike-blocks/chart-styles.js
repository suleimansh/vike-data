// Shared, framework-agnostic geometry + styling for the `chart` block, imported by BOTH the react and
// vue renderers so the twins can't drift. Everything here is pure: normalize the series, pick a scale,
// and lay out bars / line points / an area path inside a fixed W×H coordinate box (the SVG uses a
// viewBox, so the box is virtual — the plot scales to its container). Theme-native: colors are
// vike-themes CSS vars. No date/number library, no charting engine.

export const CHART_WIDTH = 320 // the virtual viewBox width; the SVG stretches to its container
const PAD_X = 6 // horizontal inset so edge bars / line ends aren't flush to the border
const PAD_Y = 6 // vertical inset so the tallest bar / peak isn't flush to the top

// Normalize a series to `{ label, value }[]`: a bare number becomes an unlabelled value; an object
// reads `label` (optional) + a numeric `value` (non-numbers coerce to 0).
export function normalizeSeries(data) {
  if (!Array.isArray(data)) return []
  return data.map((p) => {
    if (typeof p === 'number') return { label: '', value: Number.isFinite(p) ? p : 0 }
    const value = Number(p?.value)
    return { label: p?.label != null ? String(p.label) : '', value: Number.isFinite(value) ? value : 0 }
  })
}

// The y-axis top. An explicit `max` wins; otherwise round the largest value up to a "nice" number
// (1/2/2.5/5 × 10^k) so bars get a little headroom and the top reads cleanly. Always ≥ 1 (an all-zero
// series still gets a valid scale).
export function chartScaleMax(values, explicitMax) {
  if (explicitMax != null && explicitMax > 0) return explicitMax
  const peak = values.reduce((m, v) => (v > m ? v : m), 0)
  if (peak <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(peak)))
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (pow * step >= peak) return pow * step
  }
  return peak
}

// Lay out the whole chart in the virtual box: bar rects, line/area points, the line + area paths, the
// baseline y, and the resolved max. The renderer reads only what its `type` needs. `height` is the plot
// height in the same virtual units as CHART_WIDTH.
export function chartGeometry(points, { height, max }) {
  const width = CHART_WIDTH
  const n = points.length
  const values = points.map((p) => p.value)
  const scaleMax = chartScaleMax(values, max)
  const innerW = width - PAD_X * 2
  const innerH = Math.max(0, height - PAD_Y * 2)
  const baselineY = PAD_Y + innerH
  const yOf = (v) => baselineY - (Math.max(0, v) / scaleMax) * innerH

  // Bars: equal slots across the width, each bar centered in its slot at ~62% of the slot width.
  const step = n > 0 ? innerW / n : innerW
  const barW = step * 0.62
  const bars = points.map((p, i) => {
    const y = yOf(p.value)
    return { x: PAD_X + i * step + (step - barW) / 2, y, width: barW, height: baselineY - y, label: p.label, value: p.value }
  })

  // Line / area: points spread edge-to-edge (a single point sits at the left edge).
  const lineStep = n > 1 ? innerW / (n - 1) : 0
  const pts = points.map((p, i) => ({ x: PAD_X + i * lineStep, y: yOf(p.value), label: p.label, value: p.value }))
  const linePath = pts.length ? 'M' + pts.map((pt) => `${round(pt.x)},${round(pt.y)}`).join(' L') : ''
  const areaPath = pts.length ? `${linePath} L${round(pts[pts.length - 1].x)},${round(baselineY)} L${round(pts[0].x)},${round(baselineY)} Z` : ''

  return { width, scaleMax, baselineY, bars, points: pts, linePath, areaPath }
}

const round = (n) => Math.round(n * 100) / 100

// --- styles ---

export const chartRootStyle = (height) => ({
  width: '100%',
  minWidth: '220px',
  padding: '0.5rem 0.25rem 0',
  font: 'inherit',
  boxSizing: 'border-box',
})

export const chartSvgStyle = () => ({ display: 'block', width: '100%', overflow: 'visible' })

export const chartBarStyle = (color) => ({ fill: color, rx: 3 })
export const chartLineStyle = (color) => ({ fill: 'none', stroke: color, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' })
export const chartAreaFill = (color) => `color-mix(in srgb, ${color} 16%, transparent)`
export const chartBaselineStyle = () => ({ stroke: 'var(--color-border, #e2e8f0)', strokeWidth: 1 })

export const chartLabelRowStyle = () => ({ display: 'flex', marginTop: '0.35rem' })
export const chartLabelStyle = () => ({ flex: 1, minWidth: 0, textAlign: 'center', fontSize: '12px', color: 'var(--color-muted, #64748b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

export const DEFAULT_CHART_COLOR = 'var(--color-primary, #2563eb)'
