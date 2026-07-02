---
'vike-blocks': minor
---

Add the `chart` block: a dep-free, theme-native SVG chart for the common cases (bar / line / area). `chart(data).type('bar'|'line'|'area').height(px).color(css).max(n)` — a single data series of `{ label, value }` (or bare numbers), React + Vue. The plot is a viewBox SVG with a pixel-accurate vertical axis that stretches to fill its container (responsive, no measuring); x-axis labels are HTML below the SVG so text never distorts, and each bar/point carries its value on a `<title>` for hover. The scale + path geometry is a pure, tested module the two renderers share.

A real charting engine is heavy, so this covers the common shapes; rich/interactive charts stay a `custom` block that plugs in a charting library. Pie/donut is a follow-up.
