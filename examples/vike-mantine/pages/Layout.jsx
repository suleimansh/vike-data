// The app shell: wrap every page in a single <MantineProvider> (so Mantine components have their
// theme + portal target) and a small top nav. Importing ../mantine-blocks.jsx here — once, app-wide —
// performs the renderer swap before any page renders, so `<Page>`/`<Blocks>` draw the block IR with
// Mantine everywhere.
import { MantineProvider } from '../mantine-blocks.jsx'
import { Group, Anchor, Box, Title } from '@mantine/core'

export default function Layout({ children }) {
  return (
    <MantineProvider defaultColorScheme="light">
      <Box component="header" style={{ borderBottom: '1px solid var(--mantine-color-default-border)', background: 'var(--mantine-color-body)' }}>
        <Group px="lg" py="sm" gap="lg" maw={980} mx="auto">
          <Title order={5} style={{ marginRight: 'auto' }}>◆ vike-blocks × Mantine</Title>
          <Anchor href="/" size="sm">Gallery</Anchor>
          <Anchor href="/docs" size="sm">Docs shell</Anchor>
        </Group>
      </Box>
      {children}
    </MantineProvider>
  )
}
