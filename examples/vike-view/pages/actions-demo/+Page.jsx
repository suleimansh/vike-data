// The demo page: each of the user's posts with a Publish button (an action block) or a Published
// badge. The button carries only data — `action('publish').params({ id })` — and the ActionsProvider
// in +Wrapper.jsx makes the click POST /_actions/publish, then fire the onSuccess toast + reload.
// Composed as blocks and drawn with <Page>, the same renderer path the generated views use.
import { useData } from 'vike-react/useData'
import { Page } from 'vike-blocks/react'
import { definePage, heading, text, badge, button, divider } from 'vike-blocks'

export default function ActionsDemoPage() {
  const { posts } = useData()

  const sections = [
    heading('Publish a post').level(2),
    text('An owner-guarded action. Click Publish: it POSTs /_actions/publish, flips the row, and a toast fires.').tone('muted'),
    divider(),
    ...posts.flatMap((p) => [
      heading(p.title).level(4),
      p.published ? badge('Published').tone('success') : button('Publish').variant('default').action('publish').params({ id: p.id }),
    ]),
  ]

  return <Page page={definePage({ sections })} />
}
