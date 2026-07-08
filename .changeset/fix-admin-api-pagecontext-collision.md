---
'vike-admin': patch
---

The agent-API middleware no longer intercepts Vike's `*.pageContext.json` URLs, fixing client-side navigation to /admin (it previously matched them as resource endpoints and answered 404, landing every nav-link click on the error page).
