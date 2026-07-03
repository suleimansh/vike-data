// The Vue renderer for the `avatar` + `avatarGroup` blocks — the Vue twin of react/AvatarView.jsx, a
// dep-free, theme-native user image with an initials fallback (and a user icon when there's neither).
// The image is laid over the initials and hides itself on a load error (the only JS — an inline onError);
// there's no state, so SSR renders the final markup. An optional status dot; a group overlaps several
// avatars and adds a "+N" chip. Shares the styles with the React renderer via avatar-styles.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { avatarRootStyle, avatarSurfaceStyle, avatarImgStyle, statusDotStyle, statusColor, avatarGroupStyle, avatarGroupItemStyle, avatarCountStyle, USER_ICON } from '../avatar-styles.js'

const userIcon = (size) =>
  h('svg', { width: Math.round(size * 0.55), height: Math.round(size * 0.55), viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [
    h('path', { d: USER_ICON.body }),
    h('circle', { cx: USER_ICON.head.cx, cy: USER_ICON.head.cy, r: USER_ICON.head.r }),
  ])

export const AvatarView = {
  props: ['src', 'alt', 'initials', 'size', 'shape', 'status'],
  setup(props) {
    return () => {
      const size = props.size ?? 36
      const initials = props.initials ?? ''
      const surface = h('span', { style: avatarSurfaceStyle(size, props.shape ?? 'circle') }, [
        initials ? h('span', { 'data-slot': 'avatar-fallback' }, initials) : userIcon(size),
        props.src ? h('img', { 'data-slot': 'avatar-image', src: props.src, alt: props.alt ?? '', onError: (e) => (e.target.style.display = 'none'), style: avatarImgStyle() }) : null,
      ])
      return h('span', { 'data-slot': 'avatar', style: avatarRootStyle(size) }, [
        surface,
        props.status ? h('span', { 'data-slot': 'avatar-badge', 'aria-label': String(props.status), style: statusDotStyle(size, statusColor(props.status)) }) : null,
      ])
    }
  },
}

registerBlockRenderer('avatar', AvatarView)

export const AvatarGroupView = {
  props: ['avatars', 'overflow', 'size'],
  setup(props) {
    return () => {
      const size = props.size ?? 36
      const avatars = props.avatars ?? []
      const items = avatars.map((s, i) => h('span', { key: i, style: avatarGroupItemStyle(i, size) }, h(AvatarView, { ...s.resolved })))
      if (props.overflow > 0) items.push(h('span', { 'data-slot': 'avatar-group-count', style: avatarCountStyle(size) }, `+${props.overflow}`))
      return h('span', { 'data-slot': 'avatar-group', style: avatarGroupStyle() }, items)
    }
  },
}

registerBlockRenderer('avatarGroup', AvatarGroupView)
