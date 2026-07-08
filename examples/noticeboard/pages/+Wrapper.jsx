// Wraps every page in the action runner + a toast region: <ActionsProvider> makes useAction()
// (and any vike-blocks action button) live; <Toaster> renders the onSuccess toasts the publish
// action returns. The layout shell itself comes from the `layout` config (vike-layouts).
import { ActionsProvider } from 'vike-actions/react'
import { Toaster } from 'vike-blocks/react'

export default function Wrapper({ children }) {
  return (
    <ActionsProvider>
      {children}
      <Toaster />
    </ActionsProvider>
  )
}
