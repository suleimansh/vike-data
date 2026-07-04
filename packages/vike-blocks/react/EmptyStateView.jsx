// The React renderer for the `empty-state` block — a static, theme-native centered column: an
// illustration medallion, a title, a muted description, and an optional action row. A custom `icon`
// block (resolved) renders through <Blocks>; with none, a built-in inbox icon is drawn. The action
// blocks are drawn with <Blocks>, so any blocks compose there. All styling comes from the shared
// empty-state-styles module, so this can't drift from the Vue twin. No state, no animation.
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import {
  EMPTY_STATE_ICON_PATH,
  emptyStateStyle,
  emptyStateMedallionStyle,
  emptyStateTitleStyle,
  emptyStateDescriptionStyle,
  emptyStateActionsStyle,
} from '../blocks/empty-state-styles.js'

export function EmptyStateView({ title = '', description = null, icon = null, actions = [] }) {
  return (
    <div data-slot="empty-state" style={emptyStateStyle()}>
      <div style={emptyStateMedallionStyle()}>
        {icon ? (
          <Blocks sections={[icon]} />
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={EMPTY_STATE_ICON_PATH} />
          </svg>
        )}
      </div>
      {title && <p style={emptyStateTitleStyle()}>{title}</p>}
      {description != null && <p style={emptyStateDescriptionStyle()}>{description}</p>}
      {actions.length > 0 && (
        <div style={emptyStateActionsStyle()}>
          <Blocks sections={actions} />
        </div>
      )}
    </div>
  )
}

registerBlockRenderer('empty-state', EmptyStateView)
