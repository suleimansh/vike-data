---
'vike-blocks': minor
---

Add `toggle-button` + `toggle-group` blocks: a pressable on/off button and a segmented control (the shadcn Toggle / ToggleGroup staple for toolbars and segmented selects). Distinct from `switch`, which is a form boolean.

```js
toggleButton('Bold').pressed()                                  // a single pressable button
toggleGroup().item('list', 'List').item('grid', 'Grid').value('list')   // single-select segmented
toggleGroup().item('b', 'B').item('i', 'I').multiple().value(['b'])      // multi-select toolbar
```

- The builders are `toggleButton` / `toggleGroup` (the name `toggle` is the switch's builder).
- Single-select clears when you click the pressed item; `.multiple()` lets several be pressed at once.
- Accessible `<button aria-pressed>` in a `role="group"`; grouped buttons connect into a segmented control. Pressed state is local UI state, initialised from `.pressed()` / `.value()` so SSR and the first client render agree.
- React (`ToggleButtonView` / `ToggleGroupView`) + Vue renderers.
