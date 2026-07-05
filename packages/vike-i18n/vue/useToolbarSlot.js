import { ref, onMounted, onUnmounted } from 'vue'

const ROOT_ID = 'vike-toolbar-root'
const ITEMS_ID = 'vike-toolbar-items'

export function useToolbarSlot() {
  const slot = ref(undefined) // PENDING on server + first client render
  let obs = null
  onMounted(() => {
    const items = document.getElementById(ITEMS_ID)
    if (items) {
      slot.value = items
      return
    }
    if (!document.getElementById(ROOT_ID)) {
      slot.value = null
      return
    }
    obs = new MutationObserver(() => {
      const node = document.getElementById(ITEMS_ID)
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
