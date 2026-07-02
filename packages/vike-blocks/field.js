// The `field` block — a form-field CONTAINER: a label + a control slot + an optional description and
// error message, wrapping a single control block (input, select, ...) with its metadata. The
// hand-authored primitive that vike-view's schema-derived form blocks can share as the field shell.
// From-scratch + theme-native. Like card/dialog it composes a nested block, but a field holds ONE
// control (not a section list).
//
//   field('Email')
//     .description('We never share it.')
//     .control(input().type('email').placeholder('you@example.com'))
//
//   field('Password').error('Too short').control(input().type('password'))
import { registerBlock } from './registry.js'
import { resolvePage } from './page.js'

// Collapse a builder to its plain descriptor (definePage does this for top-level sections; a field's
// nested control needs the same so `resolve` gets a `{ block, ...props }` object).
const collapse = (block) => (typeof block?.build === 'function' ? block.build() : block)

// A fluent builder for a field block. `field(label)` sets the label; `.control()` sets the control
// block (collapsed now so a builder works), `.description()` / `.error()` the helper + error text.
export function field(label) {
  let control
  let description
  let error
  const self = {
    control(block) {
      control = collapse(block)
      return self
    },
    description(value) {
      description = value
      return self
    },
    error(value) {
      error = value
      return self
    },
    build() {
      return {
        block: 'field',
        ...(label !== undefined ? { label } : {}),
        ...(control !== undefined ? { control: { ...control } } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(error !== undefined ? { error } : {}),
      }
    },
  }
  return self
}

// Resolve the single control block into a serializable view-model — the recursive step that makes
// the field a container. The label / description / error text passes through; the renderer draws the
// label above the control, then the description, then the error (an error takes visual precedence).
registerBlock('field', {
  resolve({ props, tables }) {
    const control = props.control ? resolvePage({ sections: [collapse(props.control)] }, tables).sections[0] : null
    return {
      label: props.label ?? null,
      description: props.description ?? null,
      error: props.error ?? null,
      control,
    }
  },
})
