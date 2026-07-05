// The app shell: wrap every page in a single <MantineProvider> (so Mantine components have their
// theme + portal target) and a small top nav. Importing ../mantine-blocks.jsx here — once, app-wide —
// performs the renderer swap before any page renders, so `<Page>`/`<Blocks>` draw the block IR with
// Mantine everywhere.
//
// The /docs route is a full-page docs shell that brings its OWN sticky navbar, so we hide this app
// header there — otherwise the two stacked headers read like an embedded iframe.
import { MantineProvider } from '../mantine-blocks.jsx'
import { Group, Anchor, Box, Title } from '@mantine/core'
import { usePageContext } from 'vike-react/usePageContext'

export default function Layout({ children }) {
  const { urlPathname } = usePageContext()
  const showHeader = !urlPathname.startsWith('/docs')
  return (
    <MantineProvider defaultColorScheme="light">
      {showHeader && (
        <Box component="header" style={{ borderBottom: '1px solid var(--mantine-color-default-border)', background: 'var(--mantine-color-body)' }}>
          <Group px="lg" py="sm" gap="lg" maw={980} mx="auto">
            <Title order={5} style={{ marginRight: 'auto' }}>◆ vike-blocks × Mantine</Title>
            <Anchor href="/" size="sm">Gallery</Anchor>
            <Anchor href="/docs" size="sm">Docs shell</Anchor>
          </Group>
        </Box>
      )}
      {children}
    </MantineProvider>
  )
}
