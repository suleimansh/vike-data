// The one plain, serializable public user view every server path hands to the client:
// { id, email, name } (or null when there is no live session). Kept in one place so the
// render hook (oncreate.js), the guards render hook (guards-oncreate.js) and the Telefunc
// seam (server.js) can't disagree on which columns are exposed — adding a field to the
// public view is one edit here, not three literals that silently drift.
export const toPublicUser = (user) =>
  user ? { id: user.id, email: user.email, name: user.name } : null
