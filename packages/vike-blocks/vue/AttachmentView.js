// The Vue renderer for the `attachment` block — the Vue twin of react/AttachmentView.jsx, a dep-free,
// theme-native file-upload control. A dashed drop zone (a <label> wrapping a hidden file input, so a
// click opens the picker and a drag highlights the border) above the list of selected files, each
// removable. It lists its own selection (binding + the real upload are the actions axis #385), so
// declared `files` are the INITIAL list and SSR agrees with the first client render. Shares the zone,
// file rows, and byte formatter with the React renderer via attachment-styles, so they can't drift.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import {
  ATTACHMENT_ICON_PATH,
  formatBytes,
  attachmentRootStyle,
  attachmentZoneStyle,
  attachmentIconStyle,
  attachmentPromptStyle,
  attachmentHintStyle,
  attachmentListStyle,
  attachmentFileStyle,
  attachmentNameStyle,
  attachmentSizeStyle,
  attachmentRemoveStyle,
  ATTACHMENT_STYLE_TAG,
} from '../blocks/attachment-styles.js'

export const AttachmentView = {
  props: ['label', 'accept', 'multiple', 'disabled', 'name', 'files'],
  setup(props) {
    const list = ref(props.files ?? [])
    const dragOver = ref(false)

    const take = (fileList) => {
      const picked = Array.from(fileList || []).map((f) => ({ name: f.name, size: f.size, type: f.type }))
      if (picked.length) list.value = props.multiple ? picked : picked.slice(0, 1)
    }
    const onDrop = (e) => {
      e.preventDefault()
      dragOver.value = false
      if (!props.disabled) take(e.dataTransfer.files)
    }

    return () =>
      h('div', { style: attachmentRootStyle(), 'data-slot': 'attachment' }, [
        h('style', ATTACHMENT_STYLE_TAG),
        h(
          'label',
          {
            class: 'vike-blocks-attachment',
            'aria-disabled': props.disabled || undefined,
            style: attachmentZoneStyle(props.disabled, dragOver.value),
            onDragover: (e) => {
              if (props.disabled) return
              e.preventDefault()
              dragOver.value = true
            },
            onDragleave: () => (dragOver.value = false),
            onDrop,
          },
          [
            h(
              'svg',
              {
                viewBox: '0 0 24 24',
                width: '24',
                height: '24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                style: attachmentIconStyle(),
                'aria-hidden': 'true',
              },
              [h('path', { d: ATTACHMENT_ICON_PATH })],
            ),
            h('span', { style: attachmentPromptStyle() }, props.label ?? 'Drop files here or click to upload'),
            props.accept ? h('span', { style: attachmentHintStyle() }, props.accept) : null,
            h('input', {
              type: 'file',
              accept: props.accept,
              multiple: props.multiple || undefined,
              name: props.name,
              disabled: props.disabled || undefined,
              onChange: (e) => take(e.target.files),
              style: { display: 'none' },
            }),
          ],
        ),
        list.value.length > 0
          ? h(
              'ul',
              { style: attachmentListStyle() },
              list.value.map((f, i) =>
                h('li', { key: i, style: attachmentFileStyle() }, [
                  h('span', { style: attachmentNameStyle() }, f.name),
                  h('span', { style: attachmentSizeStyle() }, formatBytes(f.size)),
                  props.disabled
                    ? null
                    : h(
                        'button',
                        {
                          type: 'button',
                          'aria-label': `Remove ${f.name}`,
                          class: 'vike-blocks-attachment-x',
                          style: attachmentRemoveStyle(),
                          onClick: () => (list.value = list.value.filter((_, j) => j !== i)),
                        },
                        '×',
                      ),
                ]),
              ),
            )
          : null,
      ])
  },
}

registerBlockRenderer('attachment', AttachmentView)
