---
'vike-crud': patch
---

Fix: a `form` (or `list` / `record`) block nested in a container block (`card`, `tabs`, `field`, ...) is now found and hydrated, so composing a form into a card no longer silently breaks create/update.

The section lookups only scanned a view's top-level sections, so a nested form was invisible to the POST handler (no fields found — the submit round-tripped a 302 and wrote nothing) and was never pre-filled on an edit screen (a blank edit form that would overwrite the live row). `formFieldsFor`, `hydrateView`, the detail/auth-gate lookups in the data hook, and the ejected page's `formFields` now walk into container blocks' nested children. New `findSection` / `walkSections` / `mapSections` helpers back this and are exported for reuse.

Closes #574
