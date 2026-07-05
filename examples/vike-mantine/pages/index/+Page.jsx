// The gallery. Two things on one page:
//   1. A same-viewport PARITY strip: three leaf tokens (button / alert / input) drawn from the
//      IDENTICAL resolved descriptor by the built-in vike-blocks renderer (left) and the Mantine
//      renderer (right). Because the block registry is a global last-wins map, the two kits can't be
//      registered at once — so the strip invokes each component DIRECTLY from the same resolved
//      props (no registry lookup), which is the cleanest apples-to-apples the constraint allows.
//   2. The shared `contentPage` descriptor tree drawn through the real registry seam (<Page>), i.e.
//      entirely in Mantine — the same tree examples/vike-blocks renders as shadcn-style built-ins.
import { Container, Title, Text, Paper, SimpleGrid, Stack, Divider, Badge } from '@mantine/core'
import { resolvePage, definePage, button, alert, input } from 'vike-blocks'
import { Page, ButtonView, AlertView, InputView } from 'vike-blocks/react'
import { MantineButton, MantineAlert, MantineInput } from '../../mantine-blocks.jsx'
import { contentPage } from '../../shared-page.js'

// The view-model a block resolves to — the exact object `<Blocks>` hands its renderer.
const rp = (builder) => resolvePage(definePage({ sections: [builder] })).sections[0].resolved

// One leaf, drawn twice from the same resolved props: [built-in component, Mantine component].
const LEAVES = [
  { built: ButtonView, mant: MantineButton, items: [button('Primary').variant('primary'), button('Outline').variant('outline'), button('Ghost').variant('ghost'), button('Delete').variant('danger')] },
  { built: AlertView, mant: MantineAlert, items: [alert('Saved').intent('success').body('Your changes were saved.'), alert('Heads up').intent('warning').body('Your trial ends soon.')] },
  { built: InputView, mant: MantineInput, items: [input().type('email').placeholder('you@example.com'), input().type('password').value('hunter2')] },
]

function ParityRow({ Built, Mant, resolved }) {
  return (
    <SimpleGrid cols={2} spacing="lg" style={{ alignItems: 'center' }}>
      <Built {...resolved} />
      <Mant {...resolved} />
    </SimpleGrid>
  )
}

export default function IndexPage() {
  return (
    <Container size="md" py="xl">
      <Title order={1}>vike-blocks × Mantine</Title>
      <Text c="dimmed" mt="xs">
        One block IR, swap the renderer. vike-blocks ships its own shadcn-style React renderers; this app registers
        <b> Mantine </b> components against the same block types with <code>registerBlockRenderer</code>, so the identical
        descriptor tree draws as a whole different component kit. Sibling of the DocPress shell proof — same thesis, the
        other angle (swap the third-party library, not restructure a shell).
      </Text>

      <Paper withBorder radius="md" p="lg" mt="xl">
        <Title order={3}>Same descriptor, two kits</Title>
        <Text c="dimmed" size="sm" mt={4}>
          Each row is one resolved block descriptor rendered by the built-in component (left) and the Mantine component
          (right). Nothing about the descriptor changes between the columns.
        </Text>
        <SimpleGrid cols={2} spacing="lg" mt="md" mb="xs">
          <Badge variant="light" color="gray">Built-in (vike-blocks)</Badge>
          <Badge variant="light">Mantine</Badge>
        </SimpleGrid>
        <Stack gap="md">
          {LEAVES.map((leaf, li) =>
            leaf.items.map((b, i) => <ParityRow key={`${li}-${i}`} Built={leaf.built} Mant={leaf.mant} resolved={rp(b)} />),
          )}
        </Stack>
      </Paper>

      <Divider my="xl" label="The same tree, entirely in Mantine" labelPosition="center" />
      <Text c="dimmed" size="sm" mb="md">
        Below is a full <code>definePage([...])</code> tree — card, tabs, alert, dialog, input, button — drawn through the
        registry (<code>&lt;Page&gt;</code>), so every block is its Mantine renderer, nested composition included. Run
        <code> examples/vike-blocks</code> to see the identical tree as shadcn-style built-ins.
      </Text>
      <Page page={contentPage} />
    </Container>
  )
}
