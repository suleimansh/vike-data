// The `kbd` block — a keyboard-key leaf: one or more key caps for documenting shortcuts, defined
// through the defineBlock seam. `kbd('K')` renders a single cap; `kbd(['Ctrl', 'K'])` renders a
// combo (each key its own cap). A single string is normalized to a one-key array, so the renderer
// always draws a list of caps. Static and display-only.
//
//   kbd('Esc')
//   kbd(['Cmd', 'K'])
import { defineBlock } from '../core/registry.js'

export const kbd = defineBlock('kbd', {
  category: 'content',
  summary: "A keyboard-shortcut key hint.",
  example: "kbd(['Cmd', 'K'])",
  build: (keys) => ({ keys: Array.isArray(keys) ? keys : keys != null ? [keys] : [] }),
})
