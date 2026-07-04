// The Vue renderer for the `popover` block — the Vue twin of react/PopoverView.jsx, a dep-free,
// theme-native panel of arbitrary content anchored to a trigger. Reuses the popover primitive (anchor +
// outside-click + Escape + edge-aware flip + open-gated SSR) and draws the resolved content sections
// with <Blocks>. It tracks its own open state, so SSR renders only the trigger (no hydration mismatch).
// The trigger defaults to a themed button; a resolved `trigger` block replaces it, wrapped in a
// clickable span. Shares panel + motion + button styles with the React renderer, so it can't drift.
import { h, ref } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.js'
import { popoverPanelStyle, popoverMotionStyle } from '../blocks/popover-styles.js'
import { buttonStyle, variantKey, BUTTON_STYLE_TAG } from '../blocks/button-styles.js'

export const PopoverView = {
  props: ['label', 'content', 'trigger', 'variant', 'side', 'align'],
  setup(props) {
    const open = ref(false)
    const toggle = () => (open.value = !open.value)

    return () => {
      const label = props.label ?? 'Open'
      const variant = props.variant ?? 'outline'
      const placement = `${props.side ?? 'bottom'}-${props.align ?? 'start'}`

      const triggerNode = props.trigger
        ? h(
            'span',
            {
              role: 'button',
              tabindex: 0,
              'aria-haspopup': 'dialog',
              'aria-expanded': open.value,
              style: { display: 'inline-flex', cursor: 'pointer' },
              onClick: toggle,
              onKeydown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggle()
                }
              },
            },
            [h(Blocks, { sections: [props.trigger] })],
          )
        : h('span', { style: { display: 'contents' } }, [
            h('style', BUTTON_STYLE_TAG),
            h(
              'button',
              {
                type: 'button',
                class: 'vike-blocks-btn',
                'data-slot': 'button',
                'data-variant': variantKey(variant),
                'aria-haspopup': 'dialog',
                'aria-expanded': open.value,
                style: buttonStyle(variant),
                onClick: toggle,
              },
              label,
            ),
          ])

      return h(
        Popover,
        {
          open: open.value,
          onClose: () => (open.value = false),
          trigger: triggerNode,
          placement,
          role: 'dialog',
          panelStyle: (v, pl) => ({ ...popoverPanelStyle(), ...popoverMotionStyle(v, pl) }),
        },
        { default: () => h('div', { 'data-slot': 'popover' }, [h(Blocks, { sections: props.content ?? [] })]) },
      )
    }
  },
}

registerBlockRenderer('popover', PopoverView)
