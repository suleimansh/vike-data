---
'vike-actions': patch
---

vike-actions: stop leaking internal exception messages on 500 / guard-throw responses (closes #673).

`runAction` forwarded a thrown error's raw `.message` to the client for both the action-run 500 path and the guard-throw 403 path, while the endpoint's outer catch already sanitizes to `'Internal error'` — an inconsistency that leaked DB driver / internal detail (e.g. `duplicate key value ... Key (email)=(...)`). A thrown error's message now reaches the client only when the error opts in with an explicit integer `status` (the documented `.status = 404` path); an unexpected throw stays a generic `'Action failed'` / `'Forbidden'`.
