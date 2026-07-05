// The `empty-state` block — a static container for the "no results / get started" case that every
// table and list needs: an icon/illustration medallion, a title, a description, and an optional row of
// action blocks (a button to create the first item, a link to docs). Composes nested blocks, so the
// icon and the actions are ordinary blocks resolved recursively (like a card). Theme-native, dep-free.
//
//   emptyState('No posts yet')
//     .description('Create your first post to get started.')
//     .actions([button('New post').variant('primary')])
//
// With no `.icon(block)` the renderer draws a built-in inbox icon; pass any block (an avatar, a custom
// illustration) to override it.
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSection, collapseSections } from '../core/page.js'

// A fluent builder for an empty-state block. The icon collapses like tooltip's `.on()`; the actions
// collapse like a card's footer, so nested builders resolve recursively.
export function emptyState(title) {
  let description
  let icon
  let actions = []
  const self = {
    description(value) {
      description = value
      return self
    },
    icon(block) {
      icon = collapseSection(block)
      return self
    },
    actions(next = []) {
      actions = collapseSections(next)
      return self
    },
    build() {
      return {
        block: 'empty-state',
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(icon !== undefined ? { icon: { ...icon } } : {}),
        ...(actions.length ? { actions: actions.map((s) => ({ ...s })) } : {}),
      }
    },
  }
  return self
}

// Resolve the title + description (pass-through) + the optional custom icon block + the action blocks —
// the recursive step that makes it a container. The renderer draws the medallion (a built-in icon when
// there's no custom one), the copy, and the action row.
registerBlock('empty-state', {
  category: 'feedback',
  summary: "An empty-state placeholder with a message.",
  example: "emptyState('No posts yet')",
  resolve({ props, tables }) {
    const icon = props.icon ? resolvePage({ sections: [collapseSection(props.icon)] }, tables).sections[0] : null
    return {
      title: props.title ?? '',
      description: props.description ?? null,
      icon,
      actions: props.actions ? resolvePage({ sections: collapseSections(props.actions) }, tables).sections : [],
    }
  },
})
