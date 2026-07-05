---
'vike-actions': patch
---

vike-actions: make the Vue `ActionsProvider` react to prop changes (closes #672).

The Vue provider built its runner once in `setup()`, capturing `props.context`/`props.actions` by value — so a Vue app that updated `context` reactively kept POSTing with the context captured at first render. The React twin rebuilds via `useMemo` keyed on those props. The Vue provider now provides a stable object whose `run` reads the current props on each invocation, so reactive updates to `context`/`actions`/handlers take effect. No change to the shared runner.
