// The Vue binding for vike-blocks: the block-renderer registry (registerBlockRenderer), the
// <Blocks>/<Page> dispatch, and the built-in primitive block components. Importing this
// registers the built-in block renderers. vike-view/vue registers the schema renderers
// (list/record/form) into the same shared 'blocks'/'vue' registry.
import './ButtonView.js' // side-effect: register the button renderer
import './InputView.js' // side-effect: register the input renderer
import './TextareaView.js' // side-effect: register the textarea renderer
import './CheckboxView.js' // side-effect: register the checkbox renderer
import './RadioGroupView.js' // side-effect: register the radio renderer
import './SwitchView.js' // side-effect: register the switch renderer
import './SliderView.js' // side-effect: register the slider renderer
import './CalendarView.js' // side-effect: register the calendar renderer
import './DatePickerView.js' // side-effect: register the date-picker renderer
import './DropdownView.js' // side-effect: register the dropdown renderer
import './NavMenuView.js' // side-effect: register the nav-menu renderer
import './KbdView.js' // side-effect: register the kbd renderer
import './ItemView.js' // side-effect: register the item renderer
import './BubbleView.js' // side-effect: register the bubble renderer
import './MessageView.js' // side-effect: register the message renderer
import './MessageScrollerView.js' // side-effect: register the message-scroller renderer
import './ChartView.js' // side-effect: register the chart renderer
import './AlertView.js' // side-effect: register the alert renderer
import './TabsView.js' // side-effect: register the tabs renderer
import './AccordionView.js' // side-effect: register the accordion renderer
import './DialogView.js' // side-effect: register the dialog renderer
import './SheetView.js' // side-effect: register the sheet renderer
import './DrawerView.js' // side-effect: register the drawer renderer
import './CardView.js' // side-effect: register the card renderer
import './FieldView.js' // side-effect: register the field renderer
import './FormView.js' // side-effect: register the form renderer
import './AttachmentView.js' // side-effect: register the attachment renderer
import './CodeView.js' // side-effect: register the code renderer
import './TableView.js' // side-effect: register the table renderer
export { registerBlockRenderer, getBlockRenderer, blockRendererTokens } from './registry.js'
export { Blocks, Page } from './Blocks.js' // importing Blocks registers the built-in blocks
export { Text, Heading, Badge, Divider, Link, Markdown, Stat } from './primitives.js'
export { ButtonView } from './ButtonView.js'
export { InputView } from './InputView.js'
export { TextareaView } from './TextareaView.js'
export { CheckboxView } from './CheckboxView.js'
export { RadioGroupView } from './RadioGroupView.js'
export { SwitchView } from './SwitchView.js'
export { SliderView } from './SliderView.js'
export { CalendarView } from './CalendarView.js'
export { DatePickerView } from './DatePickerView.js'
export { DropdownView } from './DropdownView.js'
export { NavMenuView } from './NavMenuView.js'
export { KbdView } from './KbdView.js'
export { ItemView } from './ItemView.js'
export { BubbleView } from './BubbleView.js'
export { MessageView } from './MessageView.js'
export { MessageScrollerView } from './MessageScrollerView.js'
export { ChartView } from './ChartView.js'
export { AlertView } from './AlertView.js'
export { TabsView } from './TabsView.js'
export { AccordionView } from './AccordionView.js'
export { DialogView } from './DialogView.js'
export { SheetView } from './SheetView.js'
export { DrawerView } from './DrawerView.js'
export { Overlay, useOverlay } from './overlay.js'
export { Popover, usePopover } from './popover.js'
export { Toaster } from './Toaster.js'
export { CardView } from './CardView.js'
export { FieldView } from './FieldView.js'
export { FormView } from './FormView.js'
export { AttachmentView } from './AttachmentView.js'
export { CodeView } from './CodeView.js'
export { TableView } from './TableView.js'
