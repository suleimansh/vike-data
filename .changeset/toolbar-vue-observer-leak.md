---
'vike-toolbar': patch
---

vike-toolbar: disconnect the Vue `Toolbar.vue` MutationObserver on unmount (closes #671).

`Toolbar.vue` started a `MutationObserver` on `document.body` in `onMounted` but never disconnected it — `obs` was trapped in the callback scope and there was no `onUnmounted`. Unmounting before `#vike-toolbar-root` appeared (HMR / route churn in dev) leaked the observer forever. The observer is now hoisted and disconnected on unmount, matching the React twin (`usePortalTarget.js`) and the same fix already shipped in vike-themes / vike-i18n.
