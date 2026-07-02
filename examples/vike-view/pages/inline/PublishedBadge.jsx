// A slot-override component (customization tier 2). Registered under the token 'published-badge';
// a column/field marked `.slot('published-badge')` renders THIS instead of the derived cell. A
// cell component gets `{ field, value, row }` — here it turns the raw `published` boolean into a
// colored pill. Importing this module registers it (side effect), so importing it from the page
// runs on BOTH the server (SSR) and the client (hydration) — the registry is populated before
// <ListView> dispatches.
import { registerFieldWidget } from 'vike-view/react/widgets'

export function PublishedBadge({ value }) {
  const on = value === true || value === 'true' || value === 1
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: on ? 'var(--color-success, #16a34a)' : 'var(--color-muted, #64748b)',
        background: on ? 'color-mix(in srgb, var(--color-success, #16a34a) 14%, transparent)' : 'var(--color-bg, #f1f5f9)',
        border: `1px solid ${on ? 'color-mix(in srgb, var(--color-success, #16a34a) 30%, transparent)' : 'var(--color-border, #e2e8f0)'}`,
      }}
    >
      {on ? 'Published' : 'Draft'}
    </span>
  )
}

registerFieldWidget('published-badge', PublishedBadge)
