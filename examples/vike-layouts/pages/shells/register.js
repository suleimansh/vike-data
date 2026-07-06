// Register the custom `split` shell. Two calls, the same split the built-in shells use:
//   - registerShell (agnostic core) — declares the shell's KIND + the slots it renders,
//     including the custom `aside` slot. This is what defineLayout threads config into.
//   - registerLayoutShell (vike-blocks) — binds the variant name to its React component.
// Imported for its side effect by pages/+Wrapper.jsx, so it runs once on both server + client
// before any page picks `layout: 'split'`. The matching `aside` meta key is declared in +config.js.
import { registerShell } from 'vike-layouts'
import { registerLayoutShell } from 'vike-blocks/react/LayoutView'
import { SplitShell } from './SplitShell.jsx'

registerShell('split', { kind: 'app', slots: ['logo', 'nav', 'userMenu', 'aside'] })
registerLayoutShell('split', SplitShell)
