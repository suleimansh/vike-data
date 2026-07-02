// The demo page: the user's posts as a `table` block with a row-action column. Each row's Publish /
// Delete button carries only data — `action('publish').params({ id: '$row.id' })` — and the table
// renderer resolves `$row.id` against that row. The ActionsProvider in +Wrapper.jsx makes the click
// POST /_actions/<name>, then fire the onSuccess toast + reload. One descriptor, a button per row.
import { useData } from 'vike-react/useData'
import { Page } from 'vike-blocks/react'
import { definePage, heading, text, divider, table, button } from 'vike-blocks'

export default function ActionsDemoPage() {
  const { posts } = useData()

  const sections = [
    heading('Your posts').level(2),
    text('A table with a per-row action column. Publish or delete a row — an owner-guarded action runs and a toast fires.').tone('muted'),
    divider(),
    table({
      columns: [{ key: 'title', label: 'Title' }, { key: 'status', label: 'Status' }],
      rows: posts.map((p) => ({ id: p.id, title: p.title, status: p.published ? 'Published' : 'Draft' })),
    })
      .empty('No posts yet.')
      .rowActions([
        button('Publish').variant('default').size('sm').action('publish').params({ id: '$row.id' }),
        button('Delete').variant('destructive').size('sm').action('posts.delete').params({ id: '$row.id' }),
      ]),
  ]

  return <Page page={definePage({ sections })} />
}
