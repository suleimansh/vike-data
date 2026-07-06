import { Doc, code } from '../Doc.jsx'

export default function SidebarPage() {
  return (
    <Doc title="Sidebar shell">
      <p>
        The exact same slots as the home page — logo, nav, userMenu, footer — rendered by a
        different shell. Switching is one line in this route's {code('+config.js')}:
      </p>
      <pre style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '1rem', overflowX: 'auto' }}>
        <code>{`// pages/sidebar/+config.js\nexport default { layout: 'sidebar' }`}</code>
      </pre>
      <p>
        The nav is now vertical (the shell passes {code('vertical')} to its nav {code('SlotView')}),
        and the active item is still highlighted from the current URL.
      </p>
    </Doc>
  )
}
