---
'vike-csrf': patch
---

Fix the config bridge breaking client builds (#718). The onCreateGlobalContext hook was a client+server pointer-import, so any app installing an adopter transitively failed to resolve `vike-csrf/bootstrap` in its client bundle (pnpm strict layout). The hook and `bootstrap.js` are gone: `csrfGuard` now reads the resolved `csrf` / `csrfExempt` config lazily off vike's `getGlobalContextSync()`, server-only, with `vike` as an optional peer. New `settingsFromConfig(config)` export replaces the bootstrap for composition tests; explicit `configureCsrf()` still wins outside a Vike app.
