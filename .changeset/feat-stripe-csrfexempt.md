---
'vike-stripe': minor
---

Contribute the webhook routes to vike-csrf's cumulative `csrfExempt` seam (#707). Both billing models (purchase, subscription) self-declare their signature-verified webhook path, so apps never list them by hand; the first real consumer of the seam. Everything off the webhook paths stays origin-checked.
