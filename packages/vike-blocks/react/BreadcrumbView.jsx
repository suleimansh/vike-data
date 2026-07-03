// The React renderer for the `breadcrumb` block — a dep-free, theme-native page trail. A nav > ol of
// crumbs: a muted <a> link for each crumb with a `to`, the last crumb the current page (foreground,
// aria-current, no link), separated by a chevron (or a custom string). Plain links + no state, so SSR
// renders the final markup with no hydration concern. Styles come from the shared breadcrumb-styles
// module, so this can't drift from the Vue twin.
import { Fragment } from 'react'
import { registerBlockRenderer } from './registry.js'
import { breadcrumbListStyle, breadcrumbItemStyle, breadcrumbLinkStyle, breadcrumbPageStyle, breadcrumbSeparatorStyle, CHEVRON_RIGHT_PATH, BREADCRUMB_STYLE_TAG } from '../breadcrumb-styles.js'

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={CHEVRON_RIGHT_PATH} />
  </svg>
)

export function BreadcrumbView({ items = [], separator = null }) {
  const last = items.length - 1
  return (
    <nav aria-label="breadcrumb" data-slot="breadcrumb">
      <style>{BREADCRUMB_STYLE_TAG}</style>
      <ol data-slot="breadcrumb-list" style={breadcrumbListStyle()}>
        {items.map((it, i) => (
          <Fragment key={i}>
            <li data-slot="breadcrumb-item" style={breadcrumbItemStyle()}>
              {i === last ? (
                <span data-slot="breadcrumb-page" aria-current="page" style={breadcrumbPageStyle()}>
                  {it.label}
                </span>
              ) : it.to ? (
                <a href={it.to} className="vike-blocks-crumb" data-slot="breadcrumb-link" style={breadcrumbLinkStyle()}>
                  {it.label}
                </a>
              ) : (
                <span style={{ color: 'inherit' }}>{it.label}</span>
              )}
            </li>
            {i < last && (
              <li role="presentation" aria-hidden="true" data-slot="breadcrumb-separator" style={breadcrumbSeparatorStyle()}>
                {separator ?? <Chevron />}
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}

registerBlockRenderer('breadcrumb', BreadcrumbView)
