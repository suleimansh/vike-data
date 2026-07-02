// vike-blocks — composable UI as data. The framework-agnostic substrate: the block
// registry + defineBlock seam, the definePage composer, and the built-in blocks.
// Importing this root registers the bespoke blocks (stat/markdown/custom), the leaf
// primitives (text/heading/badge/divider/link), and the tabs container block. vike-view
// layers schema-driven blocks on top; a per-framework package registers the renderers.
import './blocks.js' // side-effect: register stat / markdown / custom
import './primitives.js' // side-effect: register text / heading / badge / divider / link / list
import './button.js' // side-effect: register the button block
import './input.js' // side-effect: register the input block
import './textarea.js' // side-effect: register the textarea block
import './checkbox.js' // side-effect: register the checkbox block
import './radio.js' // side-effect: register the radio block
import './switch.js' // side-effect: register the switch block
import './kbd.js' // side-effect: register the kbd block
import './item.js' // side-effect: register the item block
import './bubble.js' // side-effect: register the bubble block
import './alert.js' // side-effect: register the alert block
import './tabs.js' // side-effect: register the tabs container block
import './accordion.js' // side-effect: register the accordion container block
import './dialog.js' // side-effect: register the dialog container block
import './card.js' // side-effect: register the card container block
import './field.js' // side-effect: register the field container block

export { definePage, resolvePage } from './page.js'
export { registerBlock, getBlock, hasBlock, listBlocks, defineBlock } from './registry.js'
export { text, heading, badge, divider, link, list } from './primitives.js'
export { button } from './button.js'
export { input } from './input.js'
export { textarea } from './textarea.js'
export { checkbox } from './checkbox.js'
export { radioGroup } from './radio.js'
export { toggle } from './switch.js'
export { kbd } from './kbd.js'
export { item } from './item.js'
export { bubble } from './bubble.js'
export { alert } from './alert.js'
export { tabs } from './tabs.js'
export { accordion } from './accordion.js'
export { dialog } from './dialog.js'
export { card } from './card.js'
export { field } from './field.js'
