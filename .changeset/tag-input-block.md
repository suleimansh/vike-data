---
'vike-blocks': minor
---

Add a `tag-input` block: a tag / chip multi-select token field, filling the multi-value hole the single-select `combobox` leaves.

```js
tagInput()
  .value(['react', 'vue'])
  .suggestions(['react', 'vue', 'svelte', 'angular', 'solid'])
  .placeholder('Add a framework...')
  .name('frameworks')
```

- Removable chips plus a borderless input: type + Enter (or comma) adds a tag, Backspace on an empty input removes the last, a chip's x removes it.
- Optional `.suggestions()` pool drives an autocomplete dropdown (arrow keys + Enter, click to add), excluding already-selected values.
- `.max()` caps the tag count; with a `.name()`, hidden inputs carry the values for a native submit. Tags are local UI state initialised from `.value()`, so SSR and the first client render agree.
- React (`TagInputView`) + Vue (`TagInputView`) renderers.
