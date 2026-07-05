---
'vike-blocks': minor
---

vike-blocks: add the `stepper` block, a multi-step wizard.

The multi-step-form surface, and the sequential sibling of `tabs`. A numbered progress header (complete / current / upcoming indicators joined by connectors that fill as steps complete) sits over one active step's content, with Back / Next navigation. `stepper().step(title, [blocks], { description }).step(...).current(0).nextLabel().backLabel()` — each step's sections are ordinary blocks resolved recursively, so a step composes anything (fields, a form, a summary). Clicking a header jumps to that step. Which step is shown is local UI state seeded from the resolved `current` (clamped into range), so the server and the first client render show the same step (no hydration flash). Next is omitted on the last step, so the final step's own content (e.g. a form submit) finishes the flow — the block stays display + navigation only (mutating is the actions axis #385). Dep-free, theme-native, React + Vue twins over one shared style module. Closes #621.
