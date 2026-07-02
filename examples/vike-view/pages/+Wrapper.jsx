// Wraps every page in the action runner + a toast region. <ActionsProvider> fills the vike-blocks
// action seam (so an action button/form goes live); <Toaster> renders the onSuccess toasts. No
// `actions` prop here because the publish action has no confirm; pass the defineAction refs when you
// want a confirm prompt.
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
