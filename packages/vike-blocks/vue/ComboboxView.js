// The Vue renderer for the `combobox` block — the Vue twin of react/ComboboxView.jsx, a dep-free,
// theme-native searchable single-select that is INPUT-ANCHORED: the trigger IS the search input, so you
// type in place to filter and the list opens directly below. Reuses the popover primitive for the
// floating list only. Options are non-focusable role="option" divs, so focus stays in the input while
// you arrow through them. Tracks its own open / query / selection state, so SSR renders only the input
// (no hydration mismatch). A hidden input carries the value for a plain form POST. Shares the input /
// rows / chevron with the React renderer via combobox-styles.
import { h, ref, computed } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.js'
import { popoverSurfaceStyle, popoverMotionStyle } from '../popover-styles.js'
import {
  comboboxWrapStyle,
  comboboxInputStyle,
  comboboxChevronStyle,
  comboboxListStyle,
  comboboxItemStyle,
  comboboxEmptyStyle,
  CHEVRON_DOWN_PATH,
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

    const openList = () => {
      if (props.disabled || open.value) return
      open.value = true
      query.value = ''
      active.value = 0
    }

    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!open.value) return openList()
        active.value = Math.min(active.value + 1, filtered.value.length - 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        active.value = Math.max(active.value - 1, 0)
      } else if (e.key === 'Enter' && open.value) {
        e.preventDefault()
        const opt = filtered.value[active.value]
        if (opt) choose(opt)
      }
    }

    return () => {
      const options = props.options ?? []
      const placeholder = props.placeholder ?? 'Select...'
      const selectedOption = options.find((o) => o.value === selected.value) || null
      const inputValue = open.value ? query.value : selectedOption?.label ?? ''

      const trigger = h('span', { style: comboboxWrapStyle() }, [
        h('style', COMBOBOX_STYLE_TAG),
        h('input', {
          class: 'vike-blocks-combobox-input',
          'data-slot': 'combobox-input',
          role: 'combobox',
          'aria-expanded': open.value,
          'aria-autocomplete': 'list',
          disabled: props.disabled || undefined,
          value: inputValue,
          placeholder: open.value ? props.searchPlaceholder ?? 'Search...' : placeholder,
          onInput: (e) => {
            query.value = e.target.value
            active.value = 0
            if (!open.value) open.value = true
          },
          onMousedown: openList,
          onFocus: openList,
          onKeydown: onKeyDown,
          style: comboboxInputStyle(props.disabled),
        }),
        h('span', { 'aria-hidden': 'true', style: comboboxChevronStyle() }, [
          h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: CHEVRON_DOWN_PATH })]),
        ]),
      ])

      const rows =
        filtered.value.length === 0
          ? [h('div', { style: comboboxEmptyStyle() }, props.empty ?? 'No results.')]
          : filtered.value.map((opt, i) =>
              h(
                'div',
                {
                  key: String(opt.value),
                  role: 'option',
                  'aria-selected': opt.value === selected.value,
                  'data-active': i === active.value ? 'true' : undefined,
                  onMouseenter: () => (active.value = i),
                  onMousedown: (e) => {
                    e.preventDefault()
                    choose(opt)
                  },
                  style: comboboxItemStyle(i === active.value, opt.value === selected.value),
                },
                [h('span', opt.label), opt.value === selected.value ? h('span', { 'aria-hidden': 'true' }, '✓') : null],
              ),
            )

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
          { default: () => h('div', { role: 'listbox', 'data-slot': 'combobox', style: comboboxListStyle() }, rows) },
        ),
      ]
    }
  },
}

registerBlockRenderer('combobox', ComboboxView)
