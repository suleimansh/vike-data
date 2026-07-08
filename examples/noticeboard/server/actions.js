// The app's one domain action: publish an announcement. Registered by side-effect import at
// server start (+onCreateGlobalContext.js); the client calls it by NAME through vike-actions'
// endpoint (POST /_actions/announcements.publish), never by shipping the handler.
//
// This is where the whole stack meets: the rbac guard is the same can() the page guard and the
// admin gates use; the insert goes through the same universal-orm adapter the admin reads; and
// the fan-out is ONE notify() per member, which vike-notifications splits into database + mail +
// push deliveries per member.
import { defineAction } from 'vike-actions'
import { getAdapter } from '@universal-orm/core'
import { can } from 'vike-rbac'
import { notify } from 'vike-notifications'
import { announcementPublished } from './notifications.js'

const stamp = () => {
  const at = new Date().toISOString()
  return { created_at: at, updated_at: at }
}

defineAction('announcements.publish', {
  input: { title: 'string', body: 'string' },
  guard: (ctx) => can(ctx.user, 'announcements.post'),
  async run({ input, user }) {
    const adapter = getAdapter()
    const announcement = await adapter.insert('announcements', {
      id: globalThis.crypto.randomUUID(),
      title: input.title,
      body: input.body,
      author_id: user.id,
      ...stamp(),
    })

    // Inform every OTHER active member. A fan-out over notifiables (the feed is per person);
    // each notify() queues its own per-channel jobs, so delivery is off the request path.
    const members = await adapter.find('users', { active: true })
    await Promise.all(
      members.filter((m) => m.id !== user.id).map((m) => notify(m, announcementPublished(announcement, user))),
    )

    return announcement
  },
  onSuccess: (announcement) => ({ toast: `Published "${announcement.title}"`, redirect: '/' }),
})
