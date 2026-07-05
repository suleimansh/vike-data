---
'vike-blocks': minor
---

vike-blocks: rename the radio-group builder export `radioGroup` to `radio` to match its block type.

The block registers type `'radio'` but exported its builder as `radioGroup`, so the descriptor form `{ block: 'radio' }` and the builder form did not share a name. The builder is now `radio()`, so the two authoring forms are interconvertible and agents can rely on `builder name === block type`. (The `switch` block keeps its `toggle()` builder since `switch` is a reserved word; its type is discoverable via `describeBlock()`.)
