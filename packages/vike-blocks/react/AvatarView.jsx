// The React renderer for the `avatar` + `avatarGroup` blocks — a dep-free, theme-native user image with
// an initials fallback (and a user icon when there's neither). The image is laid over the initials and
// hides itself on a load error (the only JS — an inline onError — so a broken URL reveals the initials);
// there's no state, so SSR renders the final markup. An optional status dot; a group overlaps several
// avatars and adds a "+N" chip. Styles come from the shared avatar-styles module, so this can't drift
// from the Vue twin.
import { registerBlockRenderer } from './registry.js'
import { avatarRootStyle, avatarSurfaceStyle, avatarImgStyle, statusDotStyle, statusColor, avatarGroupStyle, avatarGroupItemStyle, avatarCountStyle, USER_ICON } from '../avatar-styles.js'

const UserIcon = ({ size }) => (
  <svg width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={USER_ICON.body} />
    <circle cx={USER_ICON.head.cx} cy={USER_ICON.head.cy} r={USER_ICON.head.r} />
  </svg>
)

export function AvatarView({ src = null, alt = '', initials = '', size = 36, shape = 'circle', status = null }) {
  return (
    <span data-slot="avatar" style={avatarRootStyle(size)}>
      <span style={avatarSurfaceStyle(size, shape)}>
        {initials ? (
          <span data-slot="avatar-fallback">{initials}</span>
        ) : (
          <UserIcon size={size} />
        )}
        {src && <img data-slot="avatar-image" src={src} alt={alt} onError={(e) => { e.currentTarget.style.display = 'none' }} style={avatarImgStyle()} />}
      </span>
      {status && <span data-slot="avatar-badge" aria-label={String(status)} style={statusDotStyle(size, statusColor(status))} />}
    </span>
  )
}

registerBlockRenderer('avatar', AvatarView)

export function AvatarGroupView({ avatars = [], overflow = 0, size = 36 }) {
  return (
    <span data-slot="avatar-group" style={avatarGroupStyle()}>
      {avatars.map((s, i) => (
        <span key={i} style={avatarGroupItemStyle(i, size)}>
          <AvatarView {...s.resolved} />
        </span>
      ))}
      {overflow > 0 && (
        <span data-slot="avatar-group-count" style={avatarCountStyle(size)}>
          {`+${overflow}`}
        </span>
      )}
    </span>
  )
}

registerBlockRenderer('avatarGroup', AvatarGroupView)
