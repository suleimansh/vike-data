// Shared, framework-agnostic style data for the `breadcrumb` block, imported by BOTH the react and vue
// renderers so the surface can't drift. Dep-free reimplementation of shadcn's breadcrumb: a nav > ol of
// crumbs (links, muted) with the last one the current page (foreground, aria-current), separated by a
// chevron. Theme-native via `var(--color-*)`; the link hover color rides the shared style tag.

// The lucide chevron-right used as the default separator.
export const CHEVRON_RIGHT_PATH = 'm9 18 6-6-6-6'

// The <ol> row: wrapping, muted, small.
export const breadcrumbListStyle = () => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  fontSize: '14px',
  color: 'var(--color-muted, #64748b)',
})

export const breadcrumbItemStyle = () => ({ display: 'inline-flex', alignItems: 'center' })
// A crumb link inherits the muted list color and brightens to the text color on hover (via the tag).
export const breadcrumbLinkStyle = () => ({ color: 'inherit', textDecoration: 'none' })
// The current page: the text color, not a link.
export const breadcrumbPageStyle = () => ({ color: 'var(--color-text, #0f172a)', fontWeight: 400 })
// The separator cell.
export const breadcrumbSeparatorStyle = () => ({ display: 'inline-flex', alignItems: 'center', color: 'var(--color-muted, #94a3b8)' })

// Static <style>: the crumb-link hover (muted -> text) transition.
export const BREADCRUMB_STYLE_TAG = '.vike-blocks-crumb{transition:color .15s ease}.vike-blocks-crumb:hover{color:var(--color-text,#0f172a)}'
