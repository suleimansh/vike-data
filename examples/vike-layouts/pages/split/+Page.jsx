import { Doc, code } from '../Doc.jsx'

export default function SplitPage() {
  return (
    <Doc title="Custom split shell">
      <p>
        A custom layout is three small steps — see {code('pages/shells/')} and the app {code('+config.js')}:
      </p>
      <ol>
        <li>{code('registerShell')} in the agnostic core — the shell's kind + the slots it renders, including a new {code('aside')} slot.</li>
        <li>{code('registerLayoutShell')} in vike-blocks — bind the {code('split')} variant to a component that arranges {code('<SlotView>')} regions.</li>
        <li>Declare a {code('meta')} key for the new {code('aside')} slot so Vike collects its config value.</li>
      </ol>
      <p>
        This shell rearranges the built-in slots (logo + vertical nav in the rail, userMenu in the
        top strip), adds bespoke chrome it owns (the {code('⌘K Search')} box), and renders a brand-new{' '}
        {code('aside')} slot on the right — the panel you see beside this text. No core change was needed
        to add either the shell or the slot.
      </p>
    </Doc>
  )
}
