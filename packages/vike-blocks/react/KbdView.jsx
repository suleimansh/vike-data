// The React renderer for the `kbd` block — a static, theme-native row of keyboard key caps. Each key
// is a <kbd> element; the caps' styling comes from the shared kbd-styles module, so this stays a thin
// binding and can't drift from the Vue twin.
import { registerBlockRenderer } from './registry.js'
import { kbdGroupStyle, kbdKeyStyle } from '../blocks/kbd-styles.js'

export function KbdView({ keys = [] }) {
  return (
    <span data-slot="kbd" style={kbdGroupStyle}>
      {keys.map((key, i) => (
        <kbd key={i} style={kbdKeyStyle}>
          {key}
        </kbd>
      ))}
    </span>
  )
}

registerBlockRenderer('kbd', KbdView)
