// The tree-view block demo. Each tree below is the `tree-view` block rendered through the registry
// (resolvePage + <Blocks>): a dep-free, theme-native nested hierarchy with per-branch expand/collapse,
// active highlighting (via .current), and roving arrow-key focus. A leaf with an href is a real <a>, so
// the tree navigates with no client JS; branches auto-open down to the current node.
import { definePage, resolvePage, tree } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem', maxWidth: 380 }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function TreeViewPage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Tree-view block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        An arbitrary-depth nested hierarchy — the file-explorer, folder-tree, org-chart, nested-settings
        surface. <code>tree().node(label, {'{ open, href, icon, badge }'}, children)</code>; children
        recurse. <code>.current(path)</code> highlights the matching leaf and auto-opens the branch that
        holds it. Branches toggle on click / Enter; arrow keys move (Up/Down) and expand/collapse
        (Right/Left). Dep-free, theme-native.
      </p>

      <Section label="File explorer (a leaf is a real link; .current auto-opens its branch)">
        {Show([
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
        ])}
      </Section>

      <Section label="A folder count badge + a disabled node">
        {Show([
          tree()
            .node('Inbox', { icon: '📥', badge: '12', open: true }, [
              { label: 'Starred', href: '/mail/starred', icon: '⭐' },
              { label: 'Sent', href: '/mail/sent', icon: '📤' },
              { label: 'Archived', icon: '🗄️', disabled: true },
            ])
            .node('Trash', { icon: '🗑️', href: '/mail/trash' }),
        ])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
