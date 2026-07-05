---
'vike-i18n': patch
'vike-themes': patch
---

vike-i18n, vike-themes: the Vue `useToolbarSlot()` now disconnects its `MutationObserver` on unmount.

Both packages started an observer in `onMounted` to wait for the vike-toolbar panel but never disconnected it if the component unmounted first, leaking the observer. They now clean up in `onUnmounted`, matching the React twins.
