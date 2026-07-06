// The React renderer for a `record` block — the read-only detail of one row. Draws the derived
// fields as a label/value list; `row` (the record's values) is optional here (the data layer
// supplies it later), so with none it shows the field structure. A field carrying `fk` shows the
// referenced row's label from `fkLabels` ({ field: { value: label } }, the same map the list block
// uses) when the data layer provides it, else the raw key. Props are the block's resolved model
// ({ table, fields, fkLabels }) plus optional `row`.
import './widgets.jsx' // side-effect: registers the built-in widgets (and any app slot registers alongside)
import { getFieldWidget } from './widget-registry.js'
import { booleanLabel } from '../list-format.js'

const rowStyle = { display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)', fontSize: 14 }
const labelStyle = { color: 'var(--color-muted)', minWidth: 160 }

function display(field, row, fkLabels) {
  if (!row) return ''
  const raw = row[field.name]
  if (raw == null) return ''
  if (field.widget === 'boolean') return booleanLabel(raw)
  if (field.fk) return String(fkLabels?.[field.name]?.[raw] ?? raw) // fk label if the data layer set it
  return String(raw)
}

// A field's value cell: a slot override (tier 2) renders the app's registered component with
// `{ field, value, row }`; otherwise the derived read-only display. An unregistered slot token
// falls back to the default, so a typo degrades gracefully.
function Cell({ field, row, fkLabels }) {
  const Slot = field.slot ? getFieldWidget(field.slot) : null
  if (Slot) return <Slot field={field} value={row?.[field.name]} row={row} />
  return display(field, row, fkLabels)
}

export function RecordView({ table, fields = [], row, fkLabels }) {
  return (
    <dl style={{ margin: 0 }} data-table={table}>
      {fields.map((f) => (
        <div key={f.name} style={rowStyle}>
          <dt style={labelStyle}>{f.label}</dt>
          <dd style={{ margin: 0, color: 'var(--color-text)' }}>
            <Cell field={f} row={row} fkLabels={fkLabels} />
          </dd>
        </div>
      ))}
    </dl>
  )
}
