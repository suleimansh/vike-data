---
'vike-blocks': patch
---

vike-blocks: align the Vue renderers with their React twins (closes #654).

The Vue overlay renderers wrapped their output in an extra root element that the React twins (which return a fragment) never emit. Command, Dialog, Drawer, Sheet, Confirm, and Toggle now return a fragment too, so both frameworks produce the same tree. Select and Nav-menu keep their `<style>` a sibling of the wrap element instead of nesting it inside. Doc-nav page-links and the List primitive now key their items, so re-renders reconcile correctly.
