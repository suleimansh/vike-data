// The React binding for vike-blocks: the block-renderer registry (registerBlockRenderer),
// the <Blocks>/<Page> dispatch, and the built-in primitive block components. Importing this
// registers the built-in block renderers. vike-view/react registers the schema renderers
// (list/record/form) into the same shared registry; a third-party vike-block-* registers its
// own with registerBlockRenderer.
import './ButtonView.jsx' // side-effect: register the button renderer
import './InputView.jsx' // side-effect: register the input renderer
import './TextareaView.jsx' // side-effect: register the textarea renderer
import './CheckboxView.jsx' // side-effect: register the checkbox renderer
import './RadioGroupView.jsx' // side-effect: register the radio renderer
import './SwitchView.jsx' // side-effect: register the switch renderer
import './SliderView.jsx' // side-effect: register the slider renderer
import './CalendarView.jsx' // side-effect: register the calendar renderer
import './DatePickerView.jsx' // side-effect: register the date-picker renderer
import './DropdownView.jsx' // side-effect: register the dropdown renderer
import './NavMenuView.jsx' // side-effect: register the nav-menu renderer
import './KbdView.jsx' // side-effect: register the kbd renderer
import './ItemView.jsx' // side-effect: register the item renderer
import './BubbleView.jsx' // side-effect: register the bubble renderer
import './MessageView.jsx' // side-effect: register the message renderer
import './MessageScrollerView.jsx' // side-effect: register the message-scroller renderer
import './AlertView.jsx' // side-effect: register the alert renderer
import './TabsView.jsx' // side-effect: register the tabs renderer
import './AccordionView.jsx' // side-effect: register the accordion renderer
import './DialogView.jsx' // side-effect: register the dialog renderer
import './SheetView.jsx' // side-effect: register the sheet renderer
import './DrawerView.jsx' // side-effect: register the drawer renderer
import './CardView.jsx' // side-effect: register the card renderer
import './FieldView.jsx' // side-effect: register the field renderer
import './AttachmentView.jsx' // side-effect: register the attachment renderer
export { registerBlockRenderer, getBlockRenderer, blockRendererTokens } from './registry.js'
export { Blocks, Page } from './Blocks.jsx' // importing Blocks registers the built-in blocks
export { Text, Heading, Badge, Divider, Link, Markdown, Stat } from './primitives.jsx'
export { ButtonView } from './ButtonView.jsx'
export { InputView } from './InputView.jsx'
export { TextareaView } from './TextareaView.jsx'
export { CheckboxView } from './CheckboxView.jsx'
export { RadioGroupView } from './RadioGroupView.jsx'
export { SwitchView } from './SwitchView.jsx'
export { SliderView } from './SliderView.jsx'
export { CalendarView } from './CalendarView.jsx'
export { DatePickerView } from './DatePickerView.jsx'
export { DropdownView } from './DropdownView.jsx'
export { NavMenuView } from './NavMenuView.jsx'
export { KbdView } from './KbdView.jsx'
export { ItemView } from './ItemView.jsx'
export { BubbleView } from './BubbleView.jsx'
export { MessageView } from './MessageView.jsx'
export { MessageScrollerView } from './MessageScrollerView.jsx'
export { AlertView } from './AlertView.jsx'
export { TabsView } from './TabsView.jsx'
export { AccordionView } from './AccordionView.jsx'
export { DialogView } from './DialogView.jsx'
export { SheetView } from './SheetView.jsx'
export { DrawerView } from './DrawerView.jsx'
export { Overlay, useOverlay } from './overlay.jsx'
export { Popover, usePopover } from './popover.jsx'
export { Toaster } from './Toaster.jsx'
export { CardView } from './CardView.jsx'
export { FieldView } from './FieldView.jsx'
export { AttachmentView } from './AttachmentView.jsx'
