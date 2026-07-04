// The React binding for vike-blocks: the block-renderer registry (registerBlockRenderer),
// the <Blocks>/<Page> dispatch, and the built-in primitive block components. Importing this
// registers the built-in block renderers. vike-crud/react registers the schema renderers
// (list/record/form) into the same shared registry; a third-party vike-block-* registers its
// own with registerBlockRenderer.
import './ButtonView.jsx' // side-effect: register the button renderer
import './InputView.jsx' // side-effect: register the input renderer
import './TextareaView.jsx' // side-effect: register the textarea renderer
import './CheckboxView.jsx' // side-effect: register the checkbox renderer
import './RadioGroupView.jsx' // side-effect: register the radio renderer
import './SelectView.jsx' // side-effect: register the select renderer
import './ComboboxView.jsx' // side-effect: register the combobox renderer
import './TagInputView.jsx' // side-effect: register the tag-input renderer
import './SwitchView.jsx' // side-effect: register the switch renderer
import './ToggleView.jsx' // side-effect: register the toggle-button + toggle-group renderers
import './SliderView.jsx' // side-effect: register the slider renderer
import './CalendarView.jsx' // side-effect: register the calendar renderer
import './DatePickerView.jsx' // side-effect: register the date-picker renderer
import './DropdownView.jsx' // side-effect: register the dropdown renderer
import './PopoverView.jsx' // side-effect: register the popover renderer
import './NavMenuView.jsx' // side-effect: register the nav-menu renderer
import './KbdView.jsx' // side-effect: register the kbd renderer
import './ItemView.jsx' // side-effect: register the item renderer
import './BubbleView.jsx' // side-effect: register the bubble renderer
import './MessageView.jsx' // side-effect: register the message renderer
import './MessageScrollerView.jsx' // side-effect: register the message-scroller renderer
import './ChartView.jsx' // side-effect: register the chart renderer
import './AlertView.jsx' // side-effect: register the alert renderer
import './TabsView.jsx' // side-effect: register the tabs renderer
import './AccordionView.jsx' // side-effect: register the accordion renderer
import './CollapsibleView.jsx' // side-effect: register the collapsible renderer
import './DialogView.jsx' // side-effect: register the dialog renderer
import './ConfirmView.jsx' // side-effect: register the confirm renderer
import './SheetView.jsx' // side-effect: register the sheet renderer
import './DrawerView.jsx' // side-effect: register the drawer renderer
import './CardView.jsx' // side-effect: register the card renderer
import './EmptyStateView.jsx' // side-effect: register the empty-state renderer
import './FieldView.jsx' // side-effect: register the field renderer
import './FormView.jsx' // side-effect: register the form renderer
import './AttachmentView.jsx' // side-effect: register the attachment renderer
import './CodeView.jsx' // side-effect: register the code renderer
import './TableView.jsx' // side-effect: register the table renderer
import './DataTableView.jsx' // side-effect: register the data-table renderer
import './TimelineView.jsx' // side-effect: register the timeline renderer
import './PaginationView.jsx' // side-effect: register the pagination renderer
import './TooltipView.jsx' // side-effect: register the tooltip renderer
import './AvatarView.jsx' // side-effect: register the avatar + avatarGroup renderers
import './SkeletonView.jsx' // side-effect: register the skeleton renderer
import './ProgressView.jsx' // side-effect: register the progress renderer
import './SpinnerView.jsx' // side-effect: register the spinner renderer
import './BreadcrumbView.jsx' // side-effect: register the breadcrumb renderer
import './CommandView.jsx' // side-effect: register the command renderer
import './LayoutView.jsx' // side-effect: register the layout container renderer
import './SlotView.jsx' // side-effect: register the slot placeholder renderer
import './DocNavView.jsx' // side-effect: register the doc-nav renderer
export { registerBlockRenderer, getBlockRenderer, blockRendererTokens } from './registry.js'
export { ActionRunnerContext, ActionRunnerProvider, useActionRunner } from './action-context.js' // the actions seam (#385)
export { Blocks, Page } from './Blocks.jsx' // importing Blocks registers the built-in blocks
export { Text, Heading, Badge, Divider, Link, List, Markdown, Stat } from './primitives.jsx'
export { ButtonView } from './ButtonView.jsx'
export { InputView } from './InputView.jsx'
export { TextareaView } from './TextareaView.jsx'
export { CheckboxView } from './CheckboxView.jsx'
export { RadioGroupView } from './RadioGroupView.jsx'
export { SelectView } from './SelectView.jsx'
export { ComboboxView } from './ComboboxView.jsx'
export { TagInputView } from './TagInputView.jsx'
export { SwitchView } from './SwitchView.jsx'
export { ToggleButtonView, ToggleGroupView } from './ToggleView.jsx'
export { SliderView } from './SliderView.jsx'
export { CalendarView } from './CalendarView.jsx'
export { DatePickerView } from './DatePickerView.jsx'
export { DropdownView } from './DropdownView.jsx'
export { PopoverView } from './PopoverView.jsx'
export { NavMenuView } from './NavMenuView.jsx'
export { KbdView } from './KbdView.jsx'
export { ItemView } from './ItemView.jsx'
export { BubbleView } from './BubbleView.jsx'
export { MessageView } from './MessageView.jsx'
export { MessageScrollerView } from './MessageScrollerView.jsx'
export { ChartView } from './ChartView.jsx'
export { AlertView } from './AlertView.jsx'
export { TabsView } from './TabsView.jsx'
export { AccordionView } from './AccordionView.jsx'
export { CollapsibleView } from './CollapsibleView.jsx'
export { DialogView } from './DialogView.jsx'
export { ConfirmView } from './ConfirmView.jsx'
export { SheetView } from './SheetView.jsx'
export { DrawerView } from './DrawerView.jsx'
export { Overlay, useOverlay } from './overlay.jsx'
export { Popover, usePopover } from './popover.jsx'
export { Toaster } from './Toaster.jsx'
export { CardView } from './CardView.jsx'
export { EmptyStateView } from './EmptyStateView.jsx'
export { FieldView } from './FieldView.jsx'
export { FormView } from './FormView.jsx'
export { AttachmentView } from './AttachmentView.jsx'
export { CodeView } from './CodeView.jsx'
export { TableView } from './TableView.jsx'
export { DataTableView } from './DataTableView.jsx'
export { TimelineView } from './TimelineView.jsx'
export { PaginationView } from './PaginationView.jsx'
export { TooltipView } from './TooltipView.jsx'
export { AvatarView, AvatarGroupView } from './AvatarView.jsx'
export { SkeletonView } from './SkeletonView.jsx'
export { ProgressView } from './ProgressView.jsx'
export { SpinnerView } from './SpinnerView.jsx'
export { BreadcrumbView } from './BreadcrumbView.jsx'
export { CommandView } from './CommandView.jsx'
export { LayoutView, LayoutConfigContext, LayoutConfigProvider, useLayoutConfig, LayoutContentContext, useLayoutContent, NavRegion, registerLayoutShell } from './LayoutView.jsx'
export { SlotView } from './SlotView.jsx'
export { DocNavView } from './DocNavView.jsx'
