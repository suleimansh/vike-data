// The Vue renderer for the `tag-input` block — the Vue twin of react/TagInputView.jsx. A dep-free,
// theme-native token field: removable chips + a borderless input (Enter / comma adds, Backspace on an
// empty input removes the last, a chip's x removes it) with an optional autocomplete dropdown. The tag
// list is local state initialised from `value` so SSR and the first client render agree; with a `name`,
// hidden inputs carry the values for a native submit. Shares styles + filtering with the React renderer
// via tag-input-styles, so it can't drift.
import { h, ref, computed } from 'vue'
import { registerBlockRenderer } from './registry.js'
import {
  TAG_REMOVE_PATH,
  tagWrapStyle,
  tagFieldStyle,
  tagChipStyle,
  tagRemoveStyle,
  tagInnerInputStyle,
  tagSuggestionsStyle,
  tagSuggestionItemStyle,
  tagEmptyStyle,
  filterSuggestions,
  TAG_INPUT_STYLE_TAG,
} from '../blocks/tag-input-styles.js'

export const TagInputView = {
  props: ['value', 'suggestions', 'placeholder', 'name', 'max', 'disabled'],
  setup(props) {
    const tags = ref(Array.isArray(props.value) ? props.value.slice() : [])
    const query = ref('')
    const focused = ref(false)
    const active = ref(-1)
    const inputEl = ref(null)

    const suggestions = computed(() => props.suggestions ?? [])
    const atMax = computed(() => props.max != null && tags.value.length >= props.max)
    const filtered = computed(() => (focused.value && suggestions.value.length ? filterSuggestions(suggestions.value, tags.value, query.value) : []))
    const showList = computed(() => filtered.value.length > 0)

    const addTag = (raw) => {
      const t = String(raw).trim()
      if (!t || tags.value.includes(t) || atMax.value) return
      tags.value = [...tags.value, t]
      query.value = ''
      active.value = -1
    }
    const removeTag = (t) => (tags.value = tags.value.filter((x) => x !== t))

    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        if (active.value >= 0 && active.value < filtered.value.length) addTag(filtered.value[active.value])
        else addTag(query.value)
      } else if (e.key === 'Backspace' && !query.value && tags.value.length) {
        removeTag(tags.value[tags.value.length - 1])
      } else if (e.key === 'ArrowDown' && showList.value) {
        e.preventDefault()
        active.value = (active.value + 1) % filtered.value.length
      } else if (e.key === 'ArrowUp' && showList.value) {
        e.preventDefault()
        active.value = active.value <= 0 ? filtered.value.length - 1 : active.value - 1
      } else if (e.key === 'Escape') {
        focused.value = false
      }
    }

    return () => {
      const disabled = !!props.disabled
      const placeholder = props.placeholder ?? 'Add a tag...'
      const name = props.name ?? null

      const chips = tags.value.map((t) =>
        h('span', { key: t, style: tagChipStyle(), 'data-slot': 'tag' }, [
          h('span', t),
          !disabled &&
            h(
              'button',
              { type: 'button', class: 'vike-blocks-tagremove', 'aria-label': `Remove ${t}`, onClick: () => removeTag(t), style: tagRemoveStyle() },
              [
                h('svg', { viewBox: '0 0 24 24', width: '12', height: '12', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.25', 'stroke-linecap': 'round', 'aria-hidden': 'true' }, [
                  h('path', { d: TAG_REMOVE_PATH }),
                ]),
              ],
            ),
        ]),
      )

      const hidden = name ? tags.value.map((t) => h('input', { key: `h-${t}`, type: 'hidden', name, value: t })) : []

      const input = disabled
        ? null
        : h('input', {
            ref: inputEl,
            type: 'text',
            value: query.value,
            placeholder: tags.value.length === 0 ? placeholder : atMax.value ? '' : '+',
            style: tagInnerInputStyle(),
            'aria-label': placeholder,
            onInput: (e) => {
              query.value = e.target.value
              active.value = -1
            },
            onKeydown: onKeyDown,
            onFocus: () => (focused.value = true),
            onBlur: () => (focused.value = false),
          })

      const field = h(
        'div',
        {
          class: 'vike-blocks-taginput',
          'data-slot': 'tag-input',
          style: tagFieldStyle(disabled),
          onClick: () => !disabled && inputEl.value?.focus(),
        },
        [...chips, ...hidden, input],
      )

      const list = showList.value
        ? h(
            'div',
            { style: tagSuggestionsStyle(), 'data-slot': 'tag-suggestions', onMousedown: (e) => e.preventDefault() },
            filtered.value.length
              ? filtered.value.map((s, i) =>
                  h(
                    'button',
                    {
                      key: s,
                      type: 'button',
                      class: 'vike-blocks-tagsuggest',
                      style: tagSuggestionItemStyle(i === active.value),
                      onMouseenter: () => (active.value = i),
                      onClick: () => {
                        addTag(s)
                        inputEl.value?.focus()
                      },
                    },
                    s,
                  ),
                )
              : [h('div', { style: tagEmptyStyle() }, 'No matches')],
          )
        : null

      return h('div', { style: tagWrapStyle() }, [h('style', TAG_INPUT_STYLE_TAG), field, list])
    }
  },
}

registerBlockRenderer('tag-input', TagInputView)
