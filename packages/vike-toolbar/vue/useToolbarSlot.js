// The canonical slot hook (Vue twin of vike-toolbar/react/useToolbarSlot). A provider-bound
// control (vike-themes' picker, vike-i18n's switcher, ...) calls this to decide WHERE to
// render, composing with vike-toolbar:
//   undefined -> PENDING: render nothing yet (server + first client paint)
//   element   -> TELEPORT the live control into the toolbar popover (#vike-toolbar-items)
//   null      -> no toolbar installed: render STANDALONE
//
// The decision is deferred to onMounted so the server render and the first client render
// agree (both PENDING), killing the flash of a standalone control that then jumps into the
// toolbar. This lives here (not copied into each consumer) so the leak-safe observer +
// cleanup is maintained in ONE place — a hand-copied version is how #671's observer leak
// slipped in. The DOM-id contract comes from the core so nothing re-hardcodes it.
import { ref, onMounted, onUnmounted } from 'vue'
import { TOOLBAR_ROOT_ID, TOOLBAR_ITEMS_ID } from '../index.js'

export function useToolbarSlot() {
  const slot = ref(undefined) // PENDING on server + first client render
  let obs = null
  onMounted(() => {
    const items = document.getElementById(TOOLBAR_ITEMS_ID)
    if (items) {
      slot.value = items
      return
    }
    if (!document.getElementById(TOOLBAR_ROOT_ID)) {
      slot.value = null
      return
    }
    // Toolbar installed but its panel hasn't portaled in yet -> wait, stay PENDING.
    obs = new MutationObserver(() => {
      const node = document.getElementById(TOOLBAR_ITEMS_ID)
      if (node) {
        slot.value = node
        obs.disconnect()
      }
    })
    obs.observe(document.body, { childList: true, subtree: true })
  })
  // Disconnect if we unmount before the toolbar panel ever portals in (matches the react twin).
  onUnmounted(() => obs?.disconnect())
  return slot
}
