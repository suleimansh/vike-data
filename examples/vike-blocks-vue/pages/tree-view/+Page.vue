<script setup>
// The tree-view block through the Vue renderer — an arbitrary-depth nested hierarchy. The open state is
// seeded from each node's resolved flag (explicit .open, else "holds the active node"), so a branch
// renders open-or-closed correctly from first paint with no hydration flash. .current highlights the
// matching leaf and auto-opens the branch down to it. Same block descriptors as the React gallery.
import { Page } from 'vike-blocks/vue'
import { definePage, heading, text, tree } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Tree-view block').level(1),
    text('An arbitrary-depth nested hierarchy — the file-explorer / folder-tree / org-chart surface. Branches toggle on click / Enter; arrow keys move and expand/collapse.').tone('muted'),

    heading('File explorer').level(3),
    text('.current auto-opens the branch holding the active leaf; a leaf with an href is a real link.').tone('muted'),
    tree()
      .current('/src/utils/dates.js')
      .node('src', { icon: '📁', open: true }, [
        { label: 'index.js', href: '/src/index.js', icon: '📄' },
        {
          label: 'utils',
          icon: '📁',
          children: [
            { label: 'dates.js', href: '/src/utils/dates.js', icon: '📄' },
            { label: 'strings.js', href: '/src/utils/strings.js', icon: '📄' },
          ],
        },
        { label: 'app.js', href: '/src/app.js', icon: '📄' },
      ])
      .node('package.json', { href: '/package.json', icon: '📄' })
      .node('README.md', { href: '/readme', icon: '📄' }),

    heading('Counts + a disabled node').level(3),
    tree()
      .node('Inbox', { icon: '📥', badge: '12', open: true }, [
        { label: 'Starred', href: '/mail/starred', icon: '⭐' },
        { label: 'Sent', href: '/mail/sent', icon: '📤' },
        { label: 'Archived', icon: '🗄️', disabled: true },
      ])
      .node('Trash', { icon: '🗑️', href: '/mail/trash' }),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
