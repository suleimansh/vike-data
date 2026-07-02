// The Vue renderer for the `chart` block — the Vue twin of react/ChartView.jsx, a dep-free, theme-native
// bar / line / area chart. The plot is a single <svg> with a fixed viewBox that scales UNIFORMLY to its
// container (CSS width:100%, height:auto): responsive with no measuring, so SSR and the client render
// identically (no width jump / flicker), and because the scale is uniform nothing distorts — circles
// stay round and bar corners stay square. `height` sets the viewBox aspect. The x-axis labels are plain
// HTML below the SVG. Shares the scale + path math with the React renderer via chart-styles.
import { h } from 'vue'
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

export const ChartView = {
  props: ['data', 'type', 'height', 'color', 'max'],
  setup(props) {
    return () => {
      const type = props.type ?? 'bar'
      const height = props.height ?? 160
      const color = props.color ?? DEFAULT_CHART_COLOR
      const points = normalizeSeries(props.data ?? [])
      const geo = chartGeometry(points, { width: CHART_WIDTH, height, max: props.max })
      const hasLabels = points.some((p) => p.label !== '')

      const titleFor = (label, value) => (label ? `${label}: ${value}` : String(value))
      const children = [h('line', { x1: '0', y1: geo.baselineY, x2: CHART_WIDTH, y2: geo.baselineY, style: chartBaselineStyle() })]

      if (type === 'area' && geo.areaPath) children.push(h('path', { d: geo.areaPath, fill: chartAreaFill(color), stroke: 'none' }))
      if ((type === 'line' || type === 'area') && geo.linePath) children.push(h('path', { d: geo.linePath, style: chartLineStyle(color) }))
      if (type === 'line' || type === 'area')
        for (const pt of geo.points) children.push(h('circle', { cx: pt.x, cy: pt.y, r: '3.5', fill: color }, [h('title', titleFor(pt.label, pt.value))]))
      if (type === 'bar') for (const b of geo.bars) children.push(h('rect', { x: b.x, y: b.y, width: b.width, height: b.height, rx: '3', fill: color }, [h('title', titleFor(b.label, b.value))]))

      const svg = h('svg', { viewBox: `0 0 ${CHART_WIDTH} ${height}`, role: 'img', style: chartSvgStyle() }, children)

      const nodes = [svg]
      if (hasLabels) nodes.push(h('div', { style: chartLabelRowStyle() }, points.map((p, i) => h('span', { key: i, style: chartLabelStyle(), title: p.label }, p.label))))
      return h('div', { style: chartRootStyle(height), 'data-slot': 'chart' }, nodes)
    }
  },
}

registerBlockRenderer('chart', ChartView)
