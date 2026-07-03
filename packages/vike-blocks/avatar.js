// The `avatar` block — a user image with an initials fallback, harvested from shadcn's Radix avatar and
// reimplemented dep-free. `avatar().src(url).name('Ada Lovelace')` shows the image, falling back to the
// derived initials (then a user icon) when there's no image or it fails to load. `.size(px)` /
// `.shape('circle'|'square')` / `.status('online'|'busy'|'away'|'offline')`. The sibling `avatarGroup`
// stacks several with an overlap and a "+N" count.
//
//   avatar().src('/me.png').name('Ada Lovelace').status('online')
//   avatar().name('Grace Hopper').shape('square')          // initials, no image
//   avatarGroup([avatar().name('Ada'), avatar().name('Grace'), avatar().name('Katherine')]).max(2)
import { registerBlock } from './registry.js'
import { resolvePage } from './page.js'
import { initials } from './avatar-styles.js'

const collapse = (block) => (typeof block?.build === 'function' ? block.build() : block)

// A fluent builder for one avatar.
export function avatar() {
  let src
  let alt
  let name
  let status
  let size = 36
  let shape = 'circle'
  const self = {
    src(url) {
      src = url
      return self
    },
    alt(text) {
      alt = text
      return self
    },
    name(n) {
      name = n
      return self
    },
    size(px) {
      size = px
      return self
    },
    shape(s) {
      shape = s === 'square' ? 'square' : 'circle'
      return self
    },
    status(kind) {
      status = kind
      return self
    },
    build() {
      return {
        block: 'avatar',
        size,
        shape,
        ...(src !== undefined ? { src } : {}),
        ...(alt !== undefined ? { alt } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(status !== undefined ? { status } : {}),
      }
    },
  }
  return self
}

// A fluent builder for a stack of avatars. `.max(n)` caps the visible count; the rest become a "+N" chip.
export function avatarGroup(list) {
  const avatars = (list ?? []).map(collapse)
  let max
  const self = {
    max(n) {
      max = n
      return self
    },
    build() {
      return { block: 'avatarGroup', avatars: avatars.map((a) => ({ ...a })), ...(max !== undefined ? { max } : {}) }
    },
  }
  return self
}

// Resolve one avatar: derive the initials from the name and default the alt to the name. The renderer
// draws the surface, the image over it (hidden on load error), and the optional status dot.
registerBlock('avatar', {
  resolve({ props }) {
    const name = props.name ?? null
    return {
      src: props.src ?? null,
      alt: props.alt ?? name ?? '',
      initials: initials(name),
      size: props.size ?? 36,
      shape: props.shape === 'square' ? 'square' : 'circle',
      status: props.status ?? null,
    }
  },
})

// Resolve a group: cap the visible avatars at `max`, resolve each recursively, and count the overflow.
registerBlock('avatarGroup', {
  resolve({ props, tables }) {
    const all = (props.avatars ?? []).map(collapse)
    const max = props.max != null && props.max > 0 ? props.max : all.length
    const shown = all.slice(0, max)
    return {
      avatars: resolvePage({ sections: shown }, tables).sections,
      overflow: Math.max(0, all.length - shown.length),
      size: shown[0]?.size ?? 36,
    }
  },
})
