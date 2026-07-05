---
'vike-blocks': patch
---

vike-blocks: complete the agent-catalog metadata for every built-in block.

All 66 blocks now carry `category`, `summary`, `container` and a copy-pasteable `example` in `describeBlock()` / `blockCatalog()` (previously 17). Every example is validated in the test suite by evaluating it against the real builders, so an agent that copies one gets a working descriptor. Purely additive metadata; no API or behavior change.
