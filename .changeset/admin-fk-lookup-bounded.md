---
'vike-admin': patch
---

vike-admin: stop foreign-key labels and pickers from enumerating a target table the user can't list (closes #676).

A FK lookup (`projects.owner_id -> users`) was bounded only by the target resource's own `scope`, which is `{}` (the whole table) when the target isn't a registered resource or has no `query`. So a user who could edit `projects` but was not a `users`-admin saw every user's email — both in the create/edit form `<select>` and in the list/view FK label map serialized into the page. FK enrichment now mirrors the user's list access to the target: only a registered resource the user may `canIndex` is read, bounded by that resource's own `query` scope. An unregistered or index-gated target yields no options and no labels (raw keys render instead). Label maps are additionally narrowed to the FK values actually referenced on the page, so an in-scope but unreferenced target row is never serialized either.
