---
'vike-view': minor
---

vike-view: slot overrides (customization tier 2) — drop your own component for one field/column of a generated view without ejecting the whole screen. A per-field `.slot(token)` on the `column()` / `display()` / `field()` builder, or a view-level `slots: { name: token }` map, carries a serializable string token onto the resolved list column / record field / form field; the renderer dispatches on it through the field-widget registry (React + Vue), falling back to the derived cell/control when nothing is registered under the token.

```js
import { registerFieldWidget } from 'vike-view/react/widgets'
registerFieldWidget('status-badge', StatusBadge) // { field, value, row }

crud({
  table: 'posts',
  list: [column('title'), column('status').slot('status-badge')],
  slots: { author: 'author-chip' }, // or a view-level map by field name
})
```

Slot tokens are strings (register the component with `registerFieldWidget`), so the block descriptor stays serializable — the same register-by-name pattern as the `custom` block and vike-storage's `file` widget. Tier 1 (config) already shipped; tier 3 (AI-assisted eject) is a separate spike (#380).
