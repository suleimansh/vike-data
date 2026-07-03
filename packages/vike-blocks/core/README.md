# core/

The framework-agnostic IR foundation. No React, no Vue, no DOM: just the block
descriptor model and the composer. A renderer package (`../react`, `../vue`) draws
what these files produce.

| File | Role |
|---|---|
| `registry.js` | The open block registry. `registerBlock(type, { resolve })` and the `defineBlock` fluent-builder seam. The single source of what block types exist. |
| `page.js` | The `definePage` composer and `resolvePage(page, tables)`, which turns block descriptors into plain serializable view-models (`{ block, props, resolved }` per section). |
| `params.js` | Token / param resolution (`resolveParams`, `resolveToken`) for data-aware props. |
| `primitives.js` | The leaf primitive blocks defined through `defineBlock`: `text` / `heading` / `badge` / `divider` / `link` / `list`. |
| `blocks.js` | The bespoke pass-through blocks whose view-model is just their props: `stat` / `custom`. |
| `overlay-motion.js` | The shared modal-motion constants (duration + easing) so `dialog` / `sheet` / `drawer` animate identically. |

Nothing here imports a block from `../blocks`; the arrow only points the other way.
