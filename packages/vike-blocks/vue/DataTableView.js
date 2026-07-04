// The Vue renderer for the `data-table` block — the Vue twin of react/DataTableView.jsx. The plain
// table upgraded with a search filter, row selection (a checkbox column + select-all), and
// column-visibility controls. Reuses the shared `table` chrome for the body + the data-table-styles
// toolbar + the pure filter, so it can't drift from the React renderer. Sort / query / selection /
// hidden-columns are local UI state; the columns menu reuses the popover primitive.
import { h, ref, computed } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.js'
import { popoverSurfaceStyle, popoverMotionStyle } from '../blocks/popover-styles.js'
import { tableCell, tableHeader, formatValue, compareRows, rowMatchesQuery } from '../blocks/table-styles.js'
import {
  dataTableToolbarStyle,
  dataTableSearchStyle,
  dataTableColumnsButtonStyle,
  dataTableColumnItemStyle,
  dataTableSelectionStyle,
  dataTableCheckboxCellStyle,
  dataTableCheckboxStyle,
  DATA_TABLE_STYLE_TAG,
} from '../blocks/data-table-styles.js'

// A native checkbox whose `indeterminate` DOM property is kept in sync via vnode lifecycle hooks.
const check = (checked, indeterminate, onChange, label) => {
  const sync = (el) => {
    el.indeterminate = indeterminate
  }
  return h('input', {
    type: 'checkbox',
    checked,
    'aria-label': label,
    style: dataTableCheckboxStyle(),
    onChange,
    onVnodeMounted: (vn) => sync(vn.el),
    onVnodeUpdated: (vn) => sync(vn.el),
  })
}

export const DataTableView = {
  props: ['columns', 'rows', 'sortable', 'filter', 'filterPlaceholder', 'selectable', 'columnToggle', 'empty'],
  setup(props) {
    const sort = ref(null)
    const query = ref('')
    const selected = ref(new Set())
    const hidden = ref(new Set())
    const menuOpen = ref(false)

    const columns = computed(() => props.columns ?? [])
    const rows = computed(() => props.rows ?? [])
    const visibleColumns = computed(() => columns.value.filter((c) => !hidden.value.has(c.key)))

    const onSort = (key) => {
      const s = sort.value
      sort.value = s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    }

    const view = computed(() => {
      const indexed = rows.value.map((row, i) => ({ row, i }))
      const filtered = props.filter ? indexed.filter(({ row }) => rowMatchesQuery(row, visibleColumns.value, query.value)) : indexed
      return props.sortable && sort.value ? [...filtered].sort((a, b) => compareRows(a.row, b.row, sort.value.key, sort.value.dir)) : filtered
    })
    const visibleIndices = computed(() => view.value.map((v) => v.i))
    const allSelected = computed(() => visibleIndices.value.length > 0 && visibleIndices.value.every((i) => selected.value.has(i)))
    const someSelected = computed(() => visibleIndices.value.some((i) => selected.value.has(i)))

    const toggleRow = (i) => {
      const next = new Set(selected.value)
      next.has(i) ? next.delete(i) : next.add(i)
      selected.value = next
    }
    const toggleAll = () => {
      const next = new Set(selected.value)
      if (allSelected.value) visibleIndices.value.forEach((i) => next.delete(i))
      else visibleIndices.value.forEach((i) => next.add(i))
      selected.value = next
    }
    const toggleColumn = (key) => {
      const next = new Set(hidden.value)
      if (next.has(key)) next.delete(key)
      else if (columns.value.length - next.size > 1) next.add(key)
      hidden.value = next
    }

    return () => {
      const selectable = !!props.selectable
      const colSpan = visibleColumns.value.length + (selectable ? 1 : 0)

      const toolbar =
        props.filter || props.columnToggle
          ? h('div', { style: dataTableToolbarStyle() }, [
              props.filter
                ? h('input', {
                    type: 'search',
                    class: 'vike-blocks-dtsearch',
                    value: query.value,
                    placeholder: props.filterPlaceholder ?? 'Search...',
                    'aria-label': props.filterPlaceholder ?? 'Search...',
                    style: dataTableSearchStyle(),
                    onInput: (e) => (query.value = e.target.value),
                  })
                : h('span'),
              props.columnToggle
                ? h(
                    Popover,
                    {
                      open: menuOpen.value,
                      onClose: () => (menuOpen.value = false),
                      placement: 'bottom-end',
                      role: 'menu',
                      trigger: h(
                        'button',
                        { type: 'button', style: dataTableColumnsButtonStyle(), 'aria-haspopup': 'menu', 'aria-expanded': menuOpen.value, onClick: () => (menuOpen.value = !menuOpen.value) },
                        'Columns',
                      ),
                      panelStyle: (v, pl) => ({ ...popoverSurfaceStyle(), ...popoverMotionStyle(v, pl) }),
                    },
                    {
                      default: () =>
                        h(
                          'div',
                          { 'data-slot': 'data-table-columns' },
                          columns.value.map((c) =>
                            h('label', { key: c.key, class: 'vike-blocks-dtcol', style: dataTableColumnItemStyle() }, [
                              h('input', { type: 'checkbox', checked: !hidden.value.has(c.key), onChange: () => toggleColumn(c.key), style: dataTableCheckboxStyle() }),
                              c.label,
                            ]),
                          ),
                        ),
                    },
                  )
                : null,
            ])
          : null

      const headCells = []
      if (selectable) headCells.push(h('th', { style: { ...tableHeader, ...dataTableCheckboxCellStyle() } }, [check(allSelected.value, someSelected.value && !allSelected.value, toggleAll, 'Select all rows')]))
      visibleColumns.value.forEach((c) => {
        const active = sort.value?.key === c.key
        const arrow = active ? (sort.value.dir === 'asc' ? ' ↑' : ' ↓') : ''
        headCells.push(
          h(
            'th',
            {
              key: c.key,
              style: { ...tableHeader, textAlign: c.align || 'left', cursor: props.sortable ? 'pointer' : 'default', userSelect: 'none' },
              onClick: props.sortable ? () => onSort(c.key) : undefined,
              'aria-sort': active ? (sort.value.dir === 'asc' ? 'ascending' : 'descending') : undefined,
            },
            `${c.label}${arrow}`,
          ),
        )
      })

      let body
      if (view.value.length === 0) {
        body = [h('tr', [h('td', { style: { ...tableCell, color: 'var(--color-muted, #64748b)' }, colspan: colSpan || 1 }, props.empty ?? 'No rows.')])]
      } else {
        body = view.value.map(({ row, i }) => {
          const cells = []
          if (selectable) cells.push(h('td', { style: { ...tableCell, ...dataTableCheckboxCellStyle() } }, [check(selected.value.has(i), false, () => toggleRow(i), `Select row ${i + 1}`)]))
          visibleColumns.value.forEach((c) => cells.push(h('td', { key: c.key, style: { ...tableCell, textAlign: c.align || 'left' } }, formatValue(row[c.key], c.format))))
          return h('tr', { key: i, 'data-selected': selectable && selected.value.has(i) ? 'true' : undefined }, cells)
        })
      }

      return h('div', { 'data-slot': 'data-table' }, [
        h('style', DATA_TABLE_STYLE_TAG),
        toolbar,
        h('table', { style: { width: '100%', borderCollapse: 'collapse' } }, [h('thead', [h('tr', headCells)]), h('tbody', body)]),
        selectable && selected.value.size > 0 ? h('div', { style: dataTableSelectionStyle() }, `${selected.value.size} selected`) : null,
      ])
    }
  },
}

registerBlockRenderer('data-table', DataTableView)
