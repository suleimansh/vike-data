---
'vike-blocks': minor
---

vike-blocks: add the `code` block — a code snippet with a filename header, a copy-to-clipboard button, line numbers, and per-line decorations (highlight / diff add / diff remove / focus). Source is kibo-ui's code-block, reimplemented dep-free (a small generic tokenizer stands in for Shiki), theme-native (colors read `--color-code-*` / `--color-*` vars), and cross-framework (React + Vue).

```js
codeBlock(src).lang('tsx').filename('App.tsx').highlight([2]).add([3]).remove([4]).focus([2, 3])
codeBlock(src).lineNumbers(false).noCopy().plain()
```

Decorations can also ride inline in the source as kibo markers (`// [!code highlight]`, `// [!code ++]`, `// [!code --]`, `// [!code focus]`), which are stripped on resolve. Grammar-exact highlighting stays an eject-to-custom-block story; multiple files compose with the `tabs` block.
