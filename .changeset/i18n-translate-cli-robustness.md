---
'vike-i18n': patch
---

vike-i18n: `vike translate` no longer loses completed locales when one locale fails.

Each locale's provider call is now wrapped so a failure (network, rate-limit, unparseable output) is logged and skipped while the locales that succeeded are still written; the run then exits non-zero so CI notices. The model-output `JSON.parse` is guarded with an actionable per-locale error instead of a bare `SyntaxError`, and unrecognized CLI flags (e.g. a `--locale` typo) are reported instead of silently ignored.
