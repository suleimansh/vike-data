---
'vike-actions': minor
---

vike-actions: add the **React client binding** (`vike-actions/react`) that fills the vike-blocks action seam (#491, part of #385).

- `<ActionsProvider>` — mounts an enabled runner into vike-blocks' `ActionRunnerProvider`, so every action-bearing button/form under it goes live. A click resolves param tokens (`$row.id`), confirms (from the `defineAction` ref), POSTs `/_actions/<name>`, then runs the `onSuccess` effect (reload / redirect / toast via vike-blocks' toast store). `onError` overrides the default error toast.
- `useAction(name)` — `{ run, pending, error }` for a hand-wired control outside the block seam.
- The effect interpreter (`applyEffect`) and run orchestration (`createRunner`) are plain, dependency-injected modules, so the full click-time flow tests without a DOM.

`vike-actions/vue` is the fast-follow.
