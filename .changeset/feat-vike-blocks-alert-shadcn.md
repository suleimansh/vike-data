---
'vike-blocks': minor
---

Restyle the **`alert`** block to the shadcn Radix alert surface (#429). It's now a bordered box with a bare accent icon, a medium-weight title, and a muted description, instead of the old tinted borderless box. The `alert(title).intent(...).body(...)` API is unchanged.

Our four intents map onto shadcn's default + destructive variants: `info` / `success` / `warning` render the default surface with an accent-colored icon; `danger` takes the destructive treatment (accent-tinted border + accent title). Aliases (`warn` / `error` / `note`) still resolve.

Still theme-native (`var(--color-*)` / `--radius`) and dep-free. The per-intent style table lives in a shared `alert-styles` module that both the React and Vue renderers import, so the two can't drift. Extended the unit tests (intent aliasing, bordered-not-tinted, destructive-only-for-danger) and updated the `/alert` demo.
