---
'vike-actions': minor
---

vike-actions: add the **Vue client binding** (`vike-actions/vue`) — the twin of `vike-actions/react` (#492, part of #385).

- `<ActionsProvider>` provides an enabled runner through vike-blocks' `provideActionRunner`, so every action-bearing button/form under it goes live; `useAction(name)` is the composable for a hand-wired control.
- Factored the framework-agnostic client core (endpoint call, effect interpreter, run orchestration) into `vike-actions/client`, so React and Vue share one implementation instead of the Vue binding importing from `react/`. No behaviour change to `vike-actions/react`.
