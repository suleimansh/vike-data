// The Vue form-field dispatcher — one control per resolved field, dispatched through the Vue
// field-widget registry (the Vue twin of vike-crud/react/FormFields.jsx). Importing ./widgets
// registers the built-ins. `values` pre-fills on edit.
import './widgets.js'
import { h } from 'vue'
import { getFieldWidget } from './widget-registry.js'

export const FormFields = (props) =>
  (props.fields ?? []).map((f) => {
    // A slot override wins (tier 2), falling back to the derived widget when no component is
    // registered under the token, so a typo degrades to the default input.
    const token = f.slot ?? (f.fk ? 'select' : (f.widget ?? f.type))
    const Widget = getFieldWidget(token) ?? getFieldWidget(f.fk ? 'select' : (f.widget ?? f.type)) ?? getFieldWidget('text')
    return h(Widget, { key: f.name, field: f, value: props.values?.[f.name] })
  })
FormFields.props = ['fields', 'values']
