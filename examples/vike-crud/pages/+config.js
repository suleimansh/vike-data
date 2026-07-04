// The whole app wiring, in one file. Two extensions installed via `extends`, one schema, and the
// generated pages -- that is the entire footprint of a schema-driven CRUD app.
//
//   - vike-react: the React renderer.
//   - vike-crud/react: the schema-driven view layer. It self-installs vike-schema (the `schemas`
//     point the views derive from) and provides the generic ViewPage + data hook the generated
//     pages point at.
//
// `schemas` contributes the `posts` table. The views themselves live in +views.js (they carry a
// `scope` function, which Vike requires be in its own +file, not inline here). We import that same
// array only to compute `pages: viewPages(views)` -- turning each view.route into a real page.
// Nothing else -- no page components, no forms, no controllers.
import vikeReact from 'vike-react/config'
import vikeView from 'vike-crud/react/config'
import { viewPages } from 'vike-crud/react/pages'
import themesExt from 'vike-themes/react'
import toolbarExt from 'vike-toolbar/react'
import layoutsExt from 'vike-layouts/react'
import views from './+views.js'
import { postsSchema } from './posts.schema.js'

export default {
  // vike-crud's generated CRUD pages (the tables, forms, toolbars) style against vike-themes'
  // --color-* token contract, so without a theme installed /posts renders unstyled. The standard
  // UI tier fixes that, each a one-line install:
  //   - themes:  the design tokens + base body style (built-in `default` theme, no config needed)
  //              + the appearance picker.
  //   - toolbar: the floating dev toolbar.
  //   - layouts: the app shell; `layout: 'topbar'` frames every route.
  extends: [vikeReact, vikeView, themesExt, toolbarExt, layoutsExt],
  title: 'vike-crud example',

  // The topbar shell + nav across the four demo routes.
  layout: 'topbar',
  logo: '◆ vike-crud',
  nav: [
    { label: 'Posts (CRUD)', href: '/posts' },
    { label: 'Inline', href: '/inline' },
    { label: 'Ejected', href: '/posts-ejected' },
    { label: 'Actions', href: '/actions-demo' },
  ],

  schemas: [postsSchema],
  pages: viewPages(views),

  // The actions endpoint. This local pointer imports pages/actions.js, which registers the `publish`
  // action AND provides the handler (with a demo user). A real app instead does
  // `extends: ['import:vike-actions/config:default']` and imports its action modules for their side effect.
  middleware: 'import:./actions.js:default',
}
