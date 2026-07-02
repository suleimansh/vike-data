---
'vike-blocks': minor
---

Add the `toast` block: transient notifications, fired imperatively like Sonner. Mount a `<Toaster />` once and call `toast('Saved')` (or `toast.success` / `toast.error` / `toast.warning` / `toast.info` / `toast.message`, and `toast.dismiss(id)`) from anywhere — app code or an action. Toasts stack in a corner region, auto-dismiss after their duration, and can be closed; `opts` are Sonner-shaped (`description`, `intent`, `position`, `duration`, with `Infinity` to persist). React + Vue, dep-free, theme-native.

This is the library's first imperative surface: the core is a framework-agnostic store (`toast` / `emitToast` / `dismissToast` / `subscribeToasts`), and the `<Toaster>` region renders it — so it stays UI-agnostic and the two framework Toasters share one source of truth. Intents reuse the alert block's vocabulary so a toast matches an alert.
