<script setup>
// /admin/:table/:id — the read-only VIEW (detail) page (mirrors vike-admin/react/ViewPage). It
// renders one row through vike-crud/vue's RecordView, plus Edit / Delete controls the data hook
// (viewData) already gated per record. No form POST here — the write path lives on the sibling
// `/edit` route; this is a plain SSR read.
import { useData } from 'vike-vue/useData'
import { BreadcrumbView } from 'vike-blocks/vue'
import { RecordView } from 'vike-crud/vue/RecordView'
import { singular } from '../text.js'

const data = useData()
const editAction = () => `/admin/${data.table}/${encodeURIComponent(data.id)}/edit`
</script>
<template>
  <div :style="{ maxWidth: '640px', margin: '0 auto' }">
    <BreadcrumbView :items="[{ label: 'Admin', to: '/admin' }, { label: data.label, to: `/admin/${data.table}` }, { label: singular(data.label) }]" />
    <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0 0' }">
      <h1 :style="{ margin: 0, fontSize: '22px' }">{{ singular(data.label) }}</h1>
      <a v-if="data.canEdit" :href="editAction()" :style="{ background: 'var(--color-primary)', color: 'var(--color-primary-text, #fff)', padding: '0.5rem 1.1rem', borderRadius: 'var(--radius, 8px)', textDecoration: 'none', fontSize: '14px' }">Edit</a>
    </div>
    <div :style="{ marginTop: 'var(--space-md, 1rem)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 'var(--radius, 10px)', padding: 'var(--space-lg, 1.5rem)' }">
      <RecordView :table="data.table" :fields="data.fields" :row="data.values" />
    </div>
    <div :style="{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: 'var(--space-md, 1rem)' }">
      <a :href="`/admin/${data.table}`" :style="{ color: 'var(--color-muted)', fontSize: '14px' }">&larr; {{ data.label }}</a>
      <!-- Delete posts `_action=delete` to the edit route (where the update/delete hook lives). -->
      <form v-if="data.canDelete" method="post" :action="editAction()" :style="{ marginLeft: 'auto' }">
        <input type="hidden" name="_action" value="delete" />
        <button type="submit" :style="{ background: 'transparent', color: 'var(--color-danger, #c0392b)', border: '1px solid var(--color-danger, #c0392b)', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius, 8px)', fontSize: '14px', cursor: 'pointer' }">Delete</button>
      </form>
    </div>
  </div>
</template>
