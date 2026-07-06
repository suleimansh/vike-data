import { Doc, code } from '../Doc.jsx'

// Home — renders in the app-default `topbar` shell (set once in pages/+config.js).
export default function HomePage() {
  return (
    <Doc title="vike-layouts">
      <p>
        A layout is a <strong>shell</strong> (where the logo, nav, content, and footer go) whose{' '}
        <strong>slots</strong> you fill from config. Pick one with {code('layout:')}, set the slots, done —
        no wrapper component, no per-page markup. This page is the {code('topbar')} shell.
      </p>
      <p>Every link in the top bar is the same app rendered through a different shell:</p>
      <ul>
        <li>{code('/')} — {code('topbar')}: horizontal nav across the top (the app default).</li>
        <li>{code('/sidebar')} — {code('sidebar')}: the same slots, vertical nav down the side.</li>
        <li>{code('/split')} — a <strong>custom</strong> shell this app registered, with a custom {code('aside')} slot.</li>
        <li>{code('/login')} — the public {code('centered')} shell (logo + card), no app nav.</li>
      </ul>
      <p>
        {code('nav')} and {code('footer')} are <strong>cumulative</strong> slots: the app fills them here, and an
        installed extension can contribute its own links into them (they compose, they don't replace). The{' '}
        <em>Docs ↗</em> item uses {code('end: true')} to sink to the trailing side. The floating toolbar
        (bottom corner) is <strong>vike-toolbar</strong>: a separate extension, not a layout slot.
      </p>
    </Doc>
  )
}
