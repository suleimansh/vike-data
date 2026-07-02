// The React renderer for the `chart` block — a dep-free, theme-native bar / line / area chart. The plot
// is a single <svg> laid out 1:1 with its measured pixel size (a ResizeObserver tracks the container
// width; height is the `height` prop), so it's responsive AND nothing distorts — circles stay round and
// bar corners stay square, unlike a stretched viewBox. Until the first measure (and on the server) it
// falls back to CHART_WIDTH, which matches the first client render, so there's no hydration mismatch.
// The x-axis labels are plain HTML below the SVG. All the scale + path math lives in the shared
// chart-styles module, so this stays a thin binding and can't drift from the Vue twin. Values ride a
// <title> for hover + a11y.
import { useState, useEffect, useRef } from 'react'
import { registerBlockRenderer } from './registry.js'
import {
  CHART_WIDTH,
  normalizeSeries,
  chartGeometry,
  chartRootStyle,
  chartSvgStyle,
  chartLineStyle,
  chartAreaFill,
  chartBaselineStyle,
  chartLabelRowStyle,
  chartLabelStyle,
  DEFAULT_CHART_COLOR,
} from '../chart-styles.js'

export function ChartView({ data = [], type = 'bar', height = 160, color = DEFAULT_CHART_COLOR, max }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(CHART_WIDTH) // fallback matches SSR; measured on mount
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth || CHART_WIDTH)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const points = normalizeSeries(data)
  const geo = chartGeometry(points, { width, height, max })
  const hasLabels = points.some((p) => p.label !== '')

  return (
    <div ref={ref} style={chartRootStyle(height)} data-slot="chart">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" style={chartSvgStyle()}>
        <line x1="0" y1={geo.baselineY} x2={width} y2={geo.baselineY} style={chartBaselineStyle()} />

        {type === 'area' && geo.areaPath && <path d={geo.areaPath} fill={chartAreaFill(color)} stroke="none" />}

        {(type === 'line' || type === 'area') && geo.linePath && <path d={geo.linePath} style={chartLineStyle(color)} />}

        {(type === 'line' || type === 'area') &&
          geo.points.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill={color}>
              <title>{pt.label ? `${pt.label}: ${pt.value}` : String(pt.value)}</title>
            </circle>
          ))}

        {type === 'bar' &&
          geo.bars.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.width} height={b.height} rx="3" fill={color}>
              <title>{b.label ? `${b.label}: ${b.value}` : String(b.value)}</title>
            </rect>
          ))}
      </svg>

      {hasLabels && (
        <div style={chartLabelRowStyle()}>
          {points.map((p, i) => (
            <span key={i} style={chartLabelStyle()} title={p.label}>
              {p.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

registerBlockRenderer('chart', ChartView)
