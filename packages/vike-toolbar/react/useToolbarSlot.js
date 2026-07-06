// The canonical slot hook. A provider-bound control (vike-themes' picker, vike-i18n's
// switcher, ...) calls this to decide WHERE to render, composing with vike-toolbar:
//   undefined -> PENDING: render nothing yet (server + first client paint)
//   element   -> TELEPORT the live control into the toolbar popover (#vike-toolbar-items)
//   null      -> no toolbar installed: render STANDALONE
//
// The decision is deferred to an effect so the server render and the first client render
// agree (both PENDING -> the control renders nothing), which is what kills the flash of a
// standalone control that then jumps into the toolbar. After mount: if the teleport target
// is present we teleport; if the toolbar isn't installed at all (its `bodyHtmlEnd` root is
// absent) we fall back to standalone; otherwise the toolbar is installed but its panel
// hasn't portaled in yet, so we wait for it (MutationObserver) — never showing standalone
// in between.
//
// This lives here (not copied into each consumer) so the leak-safe resolve + observer +
// cleanup is maintained in ONE place — a hand-copied version is exactly how #671's observer
// leak slipped in. The DOM-id contract comes from the core so nothing re-hardcodes it.
import { useState, useEffect } from 'react'
import { TOOLBAR_ROOT_ID, TOOLBAR_ITEMS_ID } from '../index.js'

export function useToolbarSlot() {
  const [slot, setSlot] = useState(undefined) // PENDING on server + first client render
  useEffect(() => {
    const items = document.getElementById(TOOLBAR_ITEMS_ID)
    if (items) {
      setSlot(items) // toolbar ready -> teleport
      return
    }
    if (!document.getElementById(TOOLBAR_ROOT_ID)) {
      setSlot(null) // no toolbar installed -> standalone
      return
    }
    // Toolbar installed but its panel hasn't portaled in yet -> wait, stay PENDING.
    const obs = new MutationObserver(() => {
      const node = document.getElementById(TOOLBAR_ITEMS_ID)
      if (node) {
        setSlot(node)
        obs.disconnect()
      }
    })
    obs.observe(document.body, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])
  return slot
}
