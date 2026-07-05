// The whole point of this example, in one file: bind MANTINE components to vike-blocks' block
// types. vike-blocks ships its own shadcn-style React renderers; here we register a different
// component kit against the SAME block descriptors, so the identical `definePage([...])` tree draws
// as Mantine. This is the swappable-renderer thesis — one block IR, swap the drawer — proven by
// swapping the entire third-party component library (the sibling of the DocPress shell PoC, #613/
// #614, which proved the "restructure a shell" angle).
//
// Two seams, both already built into vike-blocks:
//   - registerBlockRenderer(type, Component): the React half of the block registry. A later call
//     wins, so registering our Mantine component for `button` overrides the built-in shadcn one for
//     the whole app. Importing this module performs the swap.
//   - registerLayoutShell(variant, Component): the `layout` block's shell registry. Registering a
//     Mantine `docs` shell swaps the two-column documentation frame the built-in DocsShell drew.
//
// We register 6 content tokens (button / card / tabs / alert / dialog / input) + the `docs` layout
// shell — NOT the whole ~56-block catalog. Every OTHER block (text, heading, badge, link, docNav, …)
// falls through to its built-in renderer, so a Mantine card can hold a built-in heading with zero
// extra work. That fall-through is the proof the registry composes: you swap the tokens you care
// about and inherit the rest.
import { MantineProvider, Button, Card, Tabs, Alert, Modal, TextInput, PasswordInput, Title, Text, Group, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Blocks, registerBlockRenderer, registerLayoutShell } from 'vike-blocks/react'
import '@mantine/core/styles.css'

// re-export so pages/index can wrap the tree in one provider without a second Mantine import.
export { MantineProvider }

// button: map vike-blocks' variant/size vocabulary onto Mantine's. `to` renders an anchor styled as
// a button (declarative nav), matching the built-in. `action`/`params` are the actions axis (#385),
// display-only here.
const VARIANT = { primary: 'filled', default: 'filled', secondary: 'light', outline: 'outline', ghost: 'subtle', link: 'transparent', destructive: 'filled', danger: 'filled' }
const SIZE = { sm: 'xs', default: 'sm', lg: 'md', icon: 'sm' }
export function MantineButton({ label, variant = 'default', to, size = 'default', disabled = false }) {
  const color = variant === 'danger' || variant === 'destructive' ? 'red' : undefined
  const props = { variant: VARIANT[variant] ?? 'filled', color, size: SIZE[size] ?? 'sm', disabled }
  return to ? (
    <Button component="a" href={disabled ? undefined : to} {...props}>{label}</Button>
  ) : (
    <Button {...props}>{label}</Button>
  )
}

// card: a Mantine Card. Header (title + description) and footer are the block's own regions; the
// body + footer resolved sections are drawn with <Blocks>, so nested blocks keep composing (a
// button in the footer is a Mantine button; a heading in the body is a built-in heading).
export function MantineCard({ title, description, sections = [], footer }) {
  const hasHeader = title != null || description != null
  return (
    <Card withBorder radius="md" padding="lg" mt="sm">
      {hasHeader && (
        <Card.Section withBorder inheritPadding py="sm" mb="md">
          {title != null && <Title order={4} fw={600}>{title}</Title>}
          {description != null && <Text c="dimmed" size="sm" mt={title != null ? 4 : 0}>{description}</Text>}
        </Card.Section>
      )}
      <Blocks sections={sections} />
      {footer && footer.length > 0 && (
        <Card.Section withBorder inheritPadding py="sm" mt="md">
          <Group justify="flex-end" gap="sm"><Blocks sections={footer} /></Group>
        </Card.Section>
      )}
    </Card>
  )
}

// tabs: a Mantine Tabs. Each panel's resolved sections are drawn with <Blocks>.
export function MantineTabs({ tabs = [], activeValue }) {
  return (
    <Tabs defaultValue={activeValue ?? tabs[0]?.value} mt="sm">
      <Tabs.List>
        {tabs.map((t) => <Tabs.Tab key={t.value} value={t.value}>{t.label}</Tabs.Tab>)}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Panel key={t.value} value={t.value} pt="md"><Blocks sections={t.sections} /></Tabs.Panel>
      ))}
    </Tabs>
  )
}

// alert: a Mantine Alert. The block's four intents map to Mantine colors.
const ALERT_COLOR = { info: 'blue', success: 'green', warning: 'yellow', danger: 'red' }
export function MantineAlert({ title, intent = 'info', body }) {
  return <Alert color={ALERT_COLOR[intent] ?? 'blue'} title={title} variant="light" mt="sm">{body}</Alert>
}

// dialog: a Mantine Modal opened by a trigger button. Body/footer sections are drawn with <Blocks>;
// clicking any footer button closes the modal (matching the built-in dialog's footer semantics).
export function MantineDialog({ title = '', description, trigger = 'Open', sections = [], footer = [] }) {
  const [opened, { open, close }] = useDisclosure(false)
  return (
    <>
      <Button variant="default" onClick={open}>{trigger}</Button>
      <Modal opened={opened} onClose={close} title={title} centered>
        {description && <Text c="dimmed" size="sm" mb="sm">{description}</Text>}
        {sections.length > 0 && <Blocks sections={sections} />}
        {footer.length > 0 && (
          <Group justify="flex-end" gap="sm" mt="md" onClick={(e) => { if (e.target.closest('button')) close() }}>
            <Blocks sections={footer} />
          </Group>
        )}
      </Modal>
    </>
  )
}

// input: a Mantine TextInput (PasswordInput for type=password). Display-only: `value` is the initial
// value (uncontrolled), matching the built-in — value binding is the actions axis (#385).
export function MantineInput({ type = 'text', placeholder, value, name, disabled = false, required = false }) {
  const common = { placeholder, defaultValue: value, name, disabled, required: required || undefined, mt: 'xs' }
  return type === 'password' ? <PasswordInput {...common} /> : <TextInput type={type} {...common} />
}

// docs layout shell: the two-column [sidebar | article] documentation frame, drawn with Mantine
// primitives + Mantine CSS variables (so it picks up the Mantine theme). Each region's resolved
// sections are drawn with <Blocks>, so the sidebar nav + article body compose from blocks as usual.
// This is the same shell the built-in DocsShell draws — swap the renderer, keep the block IR (#420).
function MantineDocsShell({ slots }) {
  const hasSidebar = !!slots.sidebar
  return (
    <Box style={{ minHeight: '100%', background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)' }}>
      {slots.header && (
        <Box component="header" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--mantine-color-default-border)', background: 'var(--mantine-color-body)' }}>
          <Group px="md" py="sm" gap="lg" maw={1300} mx="auto"><Blocks sections={slots.header} /></Group>
        </Box>
      )}
      <Box style={{ display: 'grid', gridTemplateColumns: hasSidebar ? '260px minmax(0, 1fr)' : 'minmax(0, 1fr)', maxWidth: 1300, margin: '0 auto' }}>
        {hasSidebar && (
          <Box component="aside" style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}>
            <Box p="md" style={{ position: 'sticky', top: 57, maxHeight: 'calc(100vh - 57px)', overflowY: 'auto' }}><Blocks sections={slots.sidebar} /></Box>
          </Box>
        )}
        <Box component="main" px="xl" py="lg" style={{ minWidth: 0 }}><Blocks sections={slots.article} /></Box>
      </Box>
    </Box>
  )
}

// A tiny example-local block: an invisible scroll target so the docs-shell sidebar TOC anchors
// (#requirements, #setup, …) land BELOW the sticky navbar. `anchor('requirements')` sits just before
// its heading; scrollMarginTop clears the ~57px sticky header. Same custom-block seam as callout —
// an app-defined block is a peer of the built-ins.
export function MantineAnchor({ id }) {
  return <span id={id} aria-hidden="true" style={{ display: 'block', height: 0, scrollMarginTop: 72 }} />
}

// The swap. Importing this module runs these — later-wins over the built-in shadcn renderers.
registerBlockRenderer('button', MantineButton)
registerBlockRenderer('card', MantineCard)
registerBlockRenderer('tabs', MantineTabs)
registerBlockRenderer('alert', MantineAlert)
registerBlockRenderer('dialog', MantineDialog)
registerBlockRenderer('input', MantineInput)
registerBlockRenderer('anchor', MantineAnchor)
registerLayoutShell('docs', MantineDocsShell)
