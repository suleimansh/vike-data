---
'vike-blocks': patch
---

vike-blocks: Vue overlays (dialog/drawer/sheet/confirm) now derive their title id from Vue's `useId()`.

They previously used a module-scoped counter that is shared across requests on a long-lived SSR server and never resets, so the server id would not match the client's on hydration. `useId()` is hydration-stable and matches the React twins.
