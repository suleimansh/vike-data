// One install each, wired the idiomatic way:
//   - vike-react: the renderer.
//   - vike-auth/react: the session tier + /login + /account. vike-admin's /admin/* pages are
//     fenced to signed-in users (their guard redirects anon -> /login), so auth is required;
//     the two are loosely coupled (admin just reads pageContext.user).
//   - vike-admin/react: the /admin/* list/create/edit/delete pages + the cumulative
//     `adminResources` seam. No page file in this app for either route set.
//
// The app contributes its OWN tables through the cumulative `schemas` point (blog.schema.js)
// and its resources through `adminResources` (the sibling +adminResources.js, pointer-imported
// because resources carry functions — canView/canEdit — Vike can't serialize inline).
import vikeReact from 'vike-react/config'
import authExt from 'vike-auth/react'
import adminExt from 'vike-admin/react'
import { postsSchema, tagsSchema } from './blog.schema.js'

export default {
  extends: [vikeReact, authExt, adminExt],
  schemas: [postsSchema, tagsSchema],
  loginRedirect: '/admin', // signed-in visitors hitting /login land on the panel
  title: 'vike-admin example',
}
