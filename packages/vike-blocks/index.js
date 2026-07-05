// vike-blocks — composable UI as data. The framework-agnostic substrate: the block
// registry + defineBlock seam, the definePage composer, and the built-in blocks.
// Importing this root registers the bespoke blocks (stat/markdown/custom), the leaf
// primitives (text/heading/badge/divider/link), and the tabs container block. vike-crud
// layers schema-driven blocks on top; a per-framework package registers the renderers.
import './core/blocks.js' // side-effect: register stat / custom
import './core/primitives.js' // side-effect: register text / heading / badge / divider / link / list
import './blocks/button.js' // side-effect: register the button block
import './blocks/input.js' // side-effect: register the input block
import './blocks/textarea.js' // side-effect: register the textarea block
import './blocks/checkbox.js' // side-effect: register the checkbox block
import './blocks/radio.js' // side-effect: register the radio block
import './blocks/select.js' // side-effect: register the select block
import './blocks/combobox.js' // side-effect: register the combobox block
import './blocks/tag-input.js' // side-effect: register the tag-input block
import './blocks/switch.js' // side-effect: register the switch block
import './blocks/toggle.js' // side-effect: register the toggle-button + toggle-group blocks
import './blocks/slider.js' // side-effect: register the slider block
import './blocks/calendar.js' // side-effect: register the calendar block
import './blocks/date-picker.js' // side-effect: register the date-picker block
import './blocks/dropdown.js' // side-effect: register the dropdown block
import './blocks/popover.js' // side-effect: register the popover block
import './blocks/nav-menu.js' // side-effect: register the nav-menu block
import './blocks/kbd.js' // side-effect: register the kbd block
import './blocks/item.js' // side-effect: register the item block
import './blocks/bubble.js' // side-effect: register the bubble block
import './blocks/message.js' // side-effect: register the message block
import './blocks/message-scroller.js' // side-effect: register the message-scroller block
import './blocks/chart.js' // side-effect: register the chart block
import './blocks/alert.js' // side-effect: register the alert block
import './blocks/tabs.js' // side-effect: register the tabs container block
import './blocks/accordion.js' // side-effect: register the accordion container block
import './blocks/collapsible.js' // side-effect: register the collapsible container block
import './blocks/dialog.js' // side-effect: register the dialog container block
import './blocks/confirm.js' // side-effect: register the confirm (alert dialog) block
import './blocks/sheet.js' // side-effect: register the sheet container block
import './blocks/drawer.js' // side-effect: register the drawer container block
import './blocks/card.js' // side-effect: register the card container block
import './blocks/empty-state.js' // side-effect: register the empty-state block
import './blocks/field.js' // side-effect: register the field container block
import './blocks/form.js' // side-effect: register the form container block
import './blocks/attachment.js' // side-effect: register the attachment block
import './blocks/code.js' // side-effect: register the code block
import './blocks/markdown.js' // side-effect: register the markdown block
import './blocks/table.js' // side-effect: register the table block
import './blocks/data-table.js' // side-effect: register the data-table block
import './blocks/timeline.js' // side-effect: register the timeline block
import './blocks/pagination.js' // side-effect: register the pagination block
import './blocks/tooltip.js' // side-effect: register the tooltip block
import './blocks/avatar.js' // side-effect: register the avatar + avatarGroup blocks
import './blocks/skeleton.js' // side-effect: register the skeleton block
import './blocks/progress.js' // side-effect: register the progress block
import './blocks/spinner.js' // side-effect: register the spinner block
import './blocks/breadcrumb.js' // side-effect: register the breadcrumb block
import './blocks/command.js' // side-effect: register the command block
import './blocks/layout.js' // side-effect: register the layout container block + the slot placeholder block
import './blocks/doc-nav.js' // side-effect: register the doc-nav block (documentation sidebar tree)
import './blocks/tree-view.js' // side-effect: register the tree-view block (nested collapsible hierarchy)
import './blocks/context-menu.js' // side-effect: register the context-menu block (right-click, cursor-anchored)
import './blocks/stepper.js' // side-effect: register the stepper block (multi-step wizard)
import './blocks/description-list.js' // side-effect: register the description-list block (key-value metadata)
import './blocks/rating.js' // side-effect: register the rating block (star rating input)

export { definePage, resolvePage } from './core/page.js'
export { registerBlock, getBlock, hasBlock, listBlocks, defineBlock } from './core/registry.js'
export { resolveParams, resolveToken } from './core/params.js'
export { text, heading, badge, divider, link, list } from './core/primitives.js'
export { button } from './blocks/button.js'
export { input } from './blocks/input.js'
export { textarea } from './blocks/textarea.js'
export { checkbox } from './blocks/checkbox.js'
export { radioGroup } from './blocks/radio.js'
export { select } from './blocks/select.js'
export { combobox } from './blocks/combobox.js'
export { tagInput } from './blocks/tag-input.js'
export { toggle } from './blocks/switch.js'
export { toggleButton, toggleGroup } from './blocks/toggle.js'
export { slider } from './blocks/slider.js'
export { calendar } from './blocks/calendar.js'
export { datePicker } from './blocks/date-picker.js'
export { dropdown } from './blocks/dropdown.js'
export { popover } from './blocks/popover.js'
export { navMenu } from './blocks/nav-menu.js'
export { toast, emitToast, dismissToast, subscribeToasts } from './blocks/toast-store.js'
export { kbd } from './blocks/kbd.js'
export { item } from './blocks/item.js'
export { bubble } from './blocks/bubble.js'
export { message } from './blocks/message.js'
export { messageScroller } from './blocks/message-scroller.js'
export { chart } from './blocks/chart.js'
export { alert } from './blocks/alert.js'
export { tabs } from './blocks/tabs.js'
export { accordion } from './blocks/accordion.js'
export { collapsible } from './blocks/collapsible.js'
export { dialog } from './blocks/dialog.js'
export { confirm } from './blocks/confirm.js'
export { sheet } from './blocks/sheet.js'
export { drawer } from './blocks/drawer.js'
export { card } from './blocks/card.js'
export { emptyState } from './blocks/empty-state.js'
export { field } from './blocks/field.js'
export { form } from './blocks/form.js'
export { attachment } from './blocks/attachment.js'
export { code } from './blocks/code.js'
export { markdown } from './blocks/markdown.js'
export { table } from './blocks/table.js'
export { dataTable } from './blocks/data-table.js'
export { timeline } from './blocks/timeline.js'
export { pagination } from './blocks/pagination.js'
export { tooltip } from './blocks/tooltip.js'
export { avatar, avatarGroup } from './blocks/avatar.js'
export { skeleton } from './blocks/skeleton.js'
export { progress } from './blocks/progress.js'
export { spinner } from './blocks/spinner.js'
export { breadcrumb } from './blocks/breadcrumb.js'
export { command } from './blocks/command.js'
export { layout, slot, isActivePath } from './blocks/layout.js'
export { docNav } from './blocks/doc-nav.js'
export { groupLeveledItems, resolveDocNav } from './blocks/doc-nav-styles.js'
export { tree } from './blocks/tree-view.js'
export { resolveTree } from './blocks/tree-view-styles.js'
export { contextMenu } from './blocks/context-menu.js'
export { clampMenuPosition } from './blocks/context-menu-styles.js'
export { stepper } from './blocks/stepper.js'
export { stepState } from './blocks/stepper-styles.js'
export { descriptionList } from './blocks/description-list.js'
export { rating } from './blocks/rating.js'
export { ratingValueAt, starFill, snapRating } from './blocks/rating-styles.js'
