// The installable Vike extension for the React view pages. An app does
// `import vikeView from 'vike-crud/react/config'; extends: [vikeView]`, declares its resources, and
// spreads `viewPages(resources)` into `pages` — each page.route becomes a real page (GET renders the
// hydrated view, POST writes through the scoped data hook). It self-installs vike-schema (the
// `schemas` point the resources derive from) with Vike's pointer-import string.
//
//   import vikeView from 'vike-crud/react/config'
//   import { defineResource, resourcePages, viewPages } from 'vike-crud/react/pages'
//   const resources = resourcePages(defineResource({ table: 'posts' }))
//   export default { extends: [vikeView], resources, pages: viewPages(resources) }
//
// The authoring helpers come from 'vike-crud/react/pages' (jsx-free), NOT the 'vike-crud/react'
// barrel: +config is loaded by Vike's Node config loader, which can't transpile the .jsx the
// barrel pulls in. The barrel ('vike-crud/react') is for RUNTIME page components (ListView, etc.).
//
// `resources` is a SERVER-only (not config-env) cumulative point: server-only so a resource's auth
// FUNCTIONS survive to the data hook instead of being JSON-serialized away (the resolveUser
// precedent); cumulative so several sources can contribute. The generated pages carry the routes
// at config time (viewPages runs in the app's config), so the data hook is the only reader of
// `resources`, at request time, on the server.
export default {
  name: 'vike-crud-react',
  extends: ['import:@vike-data/vike-schema/config:default', 'import:vike-csrf/config:default'],
  meta: {
    resources: { env: { server: true }, cumulative: true },
  },
  resources: [],
}
