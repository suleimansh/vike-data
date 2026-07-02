---
'vike-blocks': minor
---

vike-blocks: add the `field` block (#426) — a from-scratch, theme-native form-field container: a label, a control slot, and an optional description and error, wrapping a single control block. `field('Email').description('We never share it.').control(input().type('email'))`; `.error('Too short')` renders the validation message. Like `card`/`dialog` it resolves its nested block recursively (the control resolves to a nested view-model), but a field holds one control rather than a section list, and it is control-agnostic — it wraps any block (the editable `input` block is the typical control; a `text` block makes a read-only value field). Wrapping the control in the `<label>` gives an implicit label/control association with no generated ids. This is the hand-authored field shell that vike-view's schema-derived form blocks can share.
