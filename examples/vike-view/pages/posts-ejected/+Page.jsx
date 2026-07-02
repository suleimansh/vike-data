// Ejected page — plain vike-react. It renders the hydrated sections through <Blocks> (the same
// renderer path the generated view used). As you outgrow the composition, wrap it in your own JSX,
// or replace <Blocks> with explicit <ListView/> / <RecordView/> / <FormView/> from 'vike-view/react'.
import { useData } from 'vike-react/useData'
import { Blocks } from 'vike-view/react'

export default function Page() {
  const { sections } = useData()
  return <Blocks sections={sections} />
}
