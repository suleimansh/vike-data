<script setup>
import { useData } from 'vike-vue/useData'
import { BreadcrumbView } from 'vike-blocks/vue'
import { FormFields } from './FormFields.js'

const data = useData()

function singular(word) {
  return word?.endsWith('s') ? word.slice(0, -1) : word
}
</script>
<template>
  <div v-if="!data.apiWrite" :style="{ maxWidth: '520px', margin: '0 auto' }">
    <BreadcrumbView :items="[{ label: 'Admin', to: '/admin' }, { label: data.label, to: `/admin/${data.table}` }, { label: `Edit ${singular(data.label)}` }]" />
    <h1 :style="{ margin: '0.5rem 0 0', fontSize: '22px' }">Edit {{ singular(data.label) }}</h1>
    <form method="post" :action="`/admin/${data.table}/${encodeURIComponent(data.id)}`" :style="{ marginTop: 'var(--space-md, 1rem)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 'var(--radius, 10px)', padding: 'var(--space-lg, 1.5rem)', display: 'grid', gap: 'var(--space-md, 1rem)' }">
      <FormFields :fields="data.fields" :values="data.values" />
      <div>
        <button type="submit" :style="{ background: 'var(--color-primary)', color: 'var(--color-primary-text, #fff)', border: 'none', padding: '0.55rem 1.1rem', borderRadius: 'var(--radius, 8px)', fontSize: '14px', cursor: 'pointer' }">Save</button>
      </div>
    </form>
    <form method="post" :action="`/admin/${data.table}/${encodeURIComponent(data.id)}`" :style="{ marginTop: 'var(--space-md, 1rem)' }">
      <input type="hidden" name="_action" value="delete" />
      <button type="submit" :style="{ border: '1px solid #dc2626', color: '#dc2626', background: 'transparent', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius, 8px)', fontSize: '14px', cursor: 'pointer' }">Delete</button>
    </form>
  </div>
</template>
