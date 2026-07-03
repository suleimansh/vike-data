// The Vue renderer for the `kbd` block — the Vue twin of react/KbdView.jsx, a static, theme-native
// row of keyboard key caps. Each key is a <kbd> element; the cap styling is shared with the React
// renderer via kbd-styles, so they can't drift.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { kbdGroupStyle, kbdKeyStyle } from '../blocks/kbd-styles.js'

export const KbdView = (props) =>
  h(
    'span',
    { 'data-slot': 'kbd', style: kbdGroupStyle },
    (props.keys ?? []).map((key, i) => h('kbd', { key: i, style: kbdKeyStyle }, key)),
  )
KbdView.props = ['keys']

registerBlockRenderer('kbd', KbdView)
