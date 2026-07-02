// The React renderer for the `chart` block — a dep-free, theme-native bar / line / area chart. The plot
// is a single <svg> with a viewBox and `preserveAspectRatio="none"`, sized to `height` px: the vertical
// axis stays pixel-accurate (heights/peaks undistorted) while the horizontal axis stretches to fill the
// container, so the chart is responsive with no measuring. Line strokes use non-scaling-stroke so they
// stay crisp, and the x-axis labels are plain HTML below the SVG so text never distorts. All the scale
// + path math lives in the shared chart-styles module, so this stays a thin binding and can't drift
// from the Vue twin. Values ride a <title> for hover + a11y.
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
  const points = normalizeSeries(data)
  const geo = chartGeometry(points, { height, max })
  const hasLabels = points.some((p) => p.label !== '')

  return (
    <div style={chartRootStyle(height)} data-slot="chart">
      <svg width="100%" height={height} viewBox={`0 0 ${CHART_WIDTH} ${height}`} preserveAspectRatio="none" role="img" style={chartSvgStyle()}>
        <line x1="0" y1={geo.baselineY} x2={CHART_WIDTH} y2={geo.baselineY} style={chartBaselineStyle()} vectorEffect="non-scaling-stroke" />

        {type === 'area' && geo.areaPath && <path d={geo.areaPath} fill={chartAreaFill(color)} stroke="none" />}

        {(type === 'line' || type === 'area') && geo.linePath && <path d={geo.linePath} style={chartLineStyle(color)} vectorEffect="non-scaling-stroke" />}

        {(type === 'line' || type === 'area') &&
          geo.points.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={color} vectorEffect="non-scaling-stroke">
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
