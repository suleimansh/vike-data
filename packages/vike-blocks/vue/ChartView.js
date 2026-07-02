// The Vue renderer for the `chart` block — the Vue twin of react/ChartView.jsx, a dep-free, theme-native
// bar / line / area chart. The plot is a single <svg> laid out 1:1 with its measured pixel size (a
// ResizeObserver tracks the container width; height is the `height` prop), so it's responsive AND
// nothing distorts — circles stay round and bar corners stay square. Until the first measure (and on
// the server) it falls back to CHART_WIDTH, matching the first client render (no hydration mismatch).
// The x-axis labels are plain HTML below the SVG. Shares the scale + path math with the React renderer
// via chart-styles, so the twins can't drift.
import { h, ref, onMounted, onUnmounted } from 'vue'
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
    const el = ref(null)
    const width = ref(CHART_WIDTH) // fallback matches SSR; measured on mount
    let ro = null
    onMounted(() => {
      if (!el.value) return
      const measure = () => (width.value = el.value.clientWidth || CHART_WIDTH)
      measure()
      ro = new ResizeObserver(measure)
      ro.observe(el.value)
    })
    onUnmounted(() => ro?.disconnect())

    return () => {
      const type = props.type ?? 'bar'
      const height = props.height ?? 160
      const color = props.color ?? DEFAULT_CHART_COLOR
      const w = width.value
      const points = normalizeSeries(props.data ?? [])
      const geo = chartGeometry(points, { width: w, height, max: props.max })
      const hasLabels = points.some((p) => p.label !== '')

      const titleFor = (label, value) => (label ? `${label}: ${value}` : String(value))
      const children = [h('line', { x1: '0', y1: geo.baselineY, x2: w, y2: geo.baselineY, style: chartBaselineStyle() })]

      if (type === 'area' && geo.areaPath) children.push(h('path', { d: geo.areaPath, fill: chartAreaFill(color), stroke: 'none' }))
      if ((type === 'line' || type === 'area') && geo.linePath) children.push(h('path', { d: geo.linePath, style: chartLineStyle(color) }))
      if (type === 'line' || type === 'area')
        for (const pt of geo.points) children.push(h('circle', { cx: pt.x, cy: pt.y, r: '3.5', fill: color }, [h('title', titleFor(pt.label, pt.value))]))
      if (type === 'bar') for (const b of geo.bars) children.push(h('rect', { x: b.x, y: b.y, width: b.width, height: b.height, rx: '3', fill: color }, [h('title', titleFor(b.label, b.value))]))

      const svg = h('svg', { width: w, height, viewBox: `0 0 ${w} ${height}`, role: 'img', style: chartSvgStyle() }, children)

      const nodes = [svg]
      if (hasLabels) nodes.push(h('div', { style: chartLabelRowStyle() }, points.map((p, i) => h('span', { key: i, style: chartLabelStyle(), title: p.label }, p.label))))
      return h('div', { ref: el, style: chartRootStyle(height), 'data-slot': 'chart' }, nodes)
    }
  },
}

registerBlockRenderer('chart', ChartView)
