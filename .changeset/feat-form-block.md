---
'vike-blocks': minor
---

vike-blocks: add the `form` block — a non-schema form container. Group `field` + control blocks into a real, ready-to-post `<form>` with a themed submit button. Scoped to native HTML submission (`method` + `action`), so it works with progressive enhancement and zero client JS, mirroring vike-view's schema `FormView`. The hand-authored, create/edit counterpart to the schema-derived form. Dep-free, theme-native, cross-framework (React + Vue).

```js
form({ action: '/members', method: 'post' })
  .fields([
    field('Name').control(input().name('name').required()),
    field('Role').control(radioGroup().name('role').option('admin', 'Admin').option('member', 'Member')),
  ])
  .submit('Create member')
```

`.action()` / `.method()` set the submit target (get | post); `.fields()` takes any blocks (usually `field` + a control); `.submit(label)` sets the button label (or `false` to compose your own footer). The JS-submission richness (named-action handlers, optimistic UI, inline validation) layers on later via the actions axis (#385).
