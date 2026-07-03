// The Vue renderer for the `combobox` block — the Vue twin of react/ComboboxView.jsx, a dep-free,
// theme-native searchable single-select. Reuses the popover primitive (anchor + outside-click + Escape
// + open-gated SSR); the panel holds a search input that filters the options and a role="listbox" of
// role="option" rows with arrow-key + Enter selection. Tracks its own open / query / selection state,
// so SSR renders only the trigger (no hydration mismatch). A hidden input carries the selected value
// for a plain form POST. Shares the trigger / search / rows with the React renderer via combobox-styles.
import { h, ref, computed } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.js'
import { popoverSurfaceStyle, popoverMotionStyle } from '../popover-styles.js'
import {
  comboboxTriggerStyle,
  comboboxPlaceholderStyle,
  comboboxSearchStyle,
  comboboxListStyle,
  comboboxItemStyle,
  comboboxEmptyStyle,
  COMBOBOX_STYLE_TAG,
  filterOptions,
} from '../combobox-styles.js'

export const ComboboxView = {
  props: ['options', 'value', 'placeholder', 'searchPlaceholder', 'empty', 'name', 'disabled'],
  setup(props) {
    const open = ref(false)
    const query = ref('')
    const selected = ref(props.value ?? null)
    const active = ref(0)
    const filtered = computed(() => filterOptions(props.options ?? [], query.value))

    const choose = (opt) => {
      selected.value = opt.value
      open.value = false
      query.value = ''
    }

    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        active.value = Math.min(active.value + 1, filtered.value.length - 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        active.value = Math.max(active.value - 1, 0)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const opt = filtered.value[active.value]
        if (opt) choose(opt)
      }
    }

    return () => {
      const options = props.options ?? []
      const placeholder = props.placeholder ?? 'Select...'
      const selectedOption = options.find((o) => o.value === selected.value) || null

      const trigger = h('span', { style: { display: 'contents' } }, [
        h('style', COMBOBOX_STYLE_TAG),
        h(
          'button',
          {
            type: 'button',
            class: 'vike-blocks-combobox-trigger',
            role: 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': open.value,
            disabled: props.disabled || undefined,
            style: comboboxTriggerStyle(props.disabled),
            onClick: () => (open.value = !open.value),
          },
          [
            h('span', { style: selectedOption ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : comboboxPlaceholderStyle() }, selectedOption ? selectedOption.label : placeholder),
            h('span', { 'aria-hidden': 'true', style: { fontSize: '11px', color: 'var(--color-muted, #64748b)' } }, '▾'),
          ],
        ),
      ])

      const rows =
        filtered.value.length === 0
          ? [h('div', { style: comboboxEmptyStyle() }, props.empty ?? 'No results.')]
          : filtered.value.map((opt, i) =>
              h(
                'button',
                {
                  key: String(opt.value),
                  type: 'button',
                  role: 'option',
                  'aria-selected': opt.value === selected.value,
                  'data-active': i === active.value ? 'true' : undefined,
                  onMouseenter: () => (active.value = i),
                  onClick: () => choose(opt),
                  style: comboboxItemStyle(i === active.value, opt.value === selected.value),
                },
                [h('span', opt.label), opt.value === selected.value ? h('span', { 'aria-hidden': 'true' }, '✓') : null],
              ),
            )

      const panel = h('div', { 'data-slot': 'combobox', onKeydown: onKeyDown }, [
        h('input', {
          class: 'vike-blocks-combobox-search',
          'data-slot': 'combobox-input',
          placeholder: props.searchPlaceholder ?? 'Search...',
          value: query.value,
          onInput: (e) => {
            query.value = e.target.value
            active.value = 0
          },
          style: comboboxSearchStyle(),
        }),
        h('div', { role: 'listbox', style: comboboxListStyle() }, rows),
      ])

      return [
        props.name != null ? h('input', { type: 'hidden', name: props.name, value: selected.value ?? '' }) : null,
        h(
          Popover,
          {
            open: open.value,
            onClose: () => (open.value = false),
            trigger,
            placement: 'bottom-start',
            role: 'listbox',
            panelStyle: (v, pl) => ({ ...popoverSurfaceStyle(), ...popoverMotionStyle(v, pl), minWidth: '14rem' }),
          },
          { default: () => panel },
        ),
      ]
    }
  },
}

registerBlockRenderer('combobox', ComboboxView)
