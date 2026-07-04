---
'vike-blocks': minor
---

Add a standalone `popover` block: a trigger that opens a floating panel of arbitrary nested content anchored to it (the general-purpose sibling of the dropdown menu, whose content is a fixed list of items).

```js
popover('Filters').content([
  field('Search').control(input().placeholder('Title contains...')),
  checkbox('Published only'),
  button('Apply').variant('primary'),
])
```

- Holds any composition of blocks (a form, a card, copy), resolved recursively.
- Trigger defaults to a themed button labelled by `popover(label)`; `.variant()` restyles it, or `.trigger(block)` supplies any block as the opener.
- `.side('top' | 'bottom')` + `.align('start' | 'end')` place it; built on the existing dep-free `usePopover` primitive, so it flips when it would overflow the viewport and closes on outside-click / Escape. SSR renders only the trigger.
- React (`PopoverView`) + Vue (`PopoverView`) renderers.
