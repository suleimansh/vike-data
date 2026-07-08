// The app's notification: one intent (an announcement was published), fanned out to every
// channel a member should hear it on. `via()` picks the channels; vike-notifications dispatches
// one vike-queue job per channel, so a bad mail key can't block the in-app feed. The mail/push
// channels are skipped (not errors) until their adapters are imported at boot.
export const announcementPublished = (announcement, author) => ({
  via: () => ['database', 'mail', 'push'],
  toDatabase: () => ({
    type: 'announcement_published',
    data: { title: announcement.title, body: announcement.body, url: `/announcements/${announcement.id}` },
  }),
  toMail: () => ({
    subject: `[Noticeboard] ${announcement.title}`,
    html: `<p><strong>${author?.name || 'A teammate'}</strong> posted a new announcement:</p><h2>${announcement.title}</h2><p>${announcement.body}</p>`,
    text: `${author?.name || 'A teammate'} posted: ${announcement.title}\n\n${announcement.body}`,
  }),
  toPush: () => ({
    title: announcement.title,
    body: announcement.body.slice(0, 120),
    url: `/announcements/${announcement.id}`,
  }),
})
