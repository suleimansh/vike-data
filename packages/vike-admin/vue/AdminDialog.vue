<script setup>
// The URL-driven admin dialog host (#598) - the Vue twin of vike-admin/react/AdminDialog. On a
// `mode: 'dialog'` resource, view / create / edit open as an overlay over the list; WHICH one is read
// from the list URL (`?view=id` / `?edit=id` / `?create`) and hydrated server-side by listData, so it
// is shareable and survives a refresh. It reuses vike-blocks' Vue `Overlay` (portal + focus-trap +
// Escape + backdrop + scroll-lock) - the same primitive the React host uses - so the two match.
//
// The create / edit FORMS post to the EXISTING routes (`/admin/:table/new`, `/admin/:table/:id/edit`),
// which insert / update and redirect to the list - closing the dialog. So there is no bespoke write
// path here. Closing (Escape / backdrop / the ×) navigates to `closeHref` (the list, minus the dialog
// param). The read-only view screen offers Edit (switches to the edit dialog) and Delete (posts to the
// edit route), mirroring the standalone ViewPage.
import { navigate } from 'vike/client/router'
import { Overlay } from 'vike-blocks/vue'
import { RecordView } from 'vike-crud/vue/RecordView'
import { FormFields } from './FormFields.js'
import { singular } from '../text.js'

// `dialog` is the hydrated active dialog (or null = closed); `table`/`label` name the resource;
// `closeHref` is the list route to return to; `editHref` switches a view dialog into its edit dialog.
const props = defineProps(['dialog', 'table', 'label', 'closeHref', 'editHref'])

const close = () => navigate(props.closeHref)

// Theme-native panel + a small scale-in, matched to the React AdminDialog so the two look identical.
const panelStyle = (visible) => ({
  width: '100%',
  maxWidth: '520px',
  padding: '1.25rem',
  background: 'var(--color-bg, var(--color-surface, #ffffff))',
  color: 'var(--color-text, #0f172a)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1)' : 'scale(0.96)',
  transition: 'opacity 180ms ease, transform 180ms ease',
})
const containerStyle = { alignItems: 'center', justifyContent: 'center', padding: '1rem' }

const primaryBtn = { background: 'var(--color-primary)', color: 'var(--color-primary-text, #fff)', border: 'none', padding: '0.55rem 1.1rem', borderRadius: 'var(--radius, 8px)', fontSize: '14px', textDecoration: 'none', cursor: 'pointer' }
const dangerBtn = { background: 'transparent', color: 'var(--color-danger, #c0392b)', border: '1px solid var(--color-danger, #c0392b)', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius, 8px)', fontSize: '14px', cursor: 'pointer' }
const formStyle = { display: 'grid', gap: 'var(--space-md, 1rem)', marginTop: '0.25rem' }

const title = () => {
  const d = props.dialog
  if (!d) return ''
  const one = singular(props.label)
  return d.screen === 'create' ? `New ${one}` : d.screen === 'edit' ? `Edit ${one}` : one
}
const newAction = () => `/admin/${props.table}/new`
const editAction = () => (props.dialog?.id != null ? `/admin/${props.table}/${encodeURIComponent(props.dialog.id)}/edit` : null)
</script>
<template>
  <Overlay :open="!!dialog" :onClose="close" labelledBy="admin-dialog-title" role="dialog" :containerStyle="containerStyle" :panelStyle="panelStyle">
    <header :style="{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }">
      <h2 id="admin-dialog-title" :style="{ margin: 0, fontSize: '18px', fontWeight: 600 }">{{ title() }}</h2>
      <button type="button" aria-label="Close" @click="close" :style="{ flexShrink: 0, border: 0, background: 'transparent', cursor: 'pointer', fontSize: '22px', lineHeight: 1, color: 'var(--color-muted, #64748b)' }">×</button>
    </header>

    <template v-if="dialog?.screen === 'view'">
      <RecordView :table="table" :fields="dialog.fields" :row="dialog.values" />
      <div :style="{ display: 'flex', gap: '0.9rem', alignItems: 'center', marginTop: 'var(--space-md, 1rem)' }">
        <a v-if="dialog.canEdit && editHref" :href="editHref" :style="primaryBtn">Edit</a>
        <!-- Delete posts `_action=delete` to the edit route (where the update/delete hook lives). -->
        <form v-if="dialog.canDelete && editAction()" method="post" :action="editAction()" :style="{ marginLeft: 'auto' }">
          <input type="hidden" name="_action" value="delete" />
          <button type="submit" :style="dangerBtn">Delete</button>
        </form>
      </div>
    </template>

    <form v-else-if="dialog?.screen === 'edit' && editAction()" method="post" :action="editAction()" :style="formStyle">
      <FormFields :fields="dialog.fields" :values="dialog.values" />
      <div><button type="submit" :style="primaryBtn">Save</button></div>
    </form>

    <form v-else-if="dialog?.screen === 'create'" method="post" :action="newAction()" :style="formStyle">
      <FormFields :fields="dialog.fields" />
      <div><button type="submit" :style="primaryBtn">Create</button></div>
    </form>
  </Overlay>
</template>
