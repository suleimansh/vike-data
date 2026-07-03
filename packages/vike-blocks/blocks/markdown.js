// The `markdown` block - a leaf that renders a markdown source string, defined through the
// defineBlock seam so it reads like the other leaves (text/heading/code) instead of a raw
// { block: 'markdown', source } descriptor.
//
//   markdown('# Title\n\nSome **bold** copy.')
//
// The built-in renderer is an MVP (the source in a pre-wrapped block, zero deps); an app swaps in a
// real markdown renderer with registerBlockRenderer('markdown', ...). The block type stays 'markdown'.
import { defineBlock } from '../core/registry.js'

export const markdown = defineBlock('markdown', {
  build: (source) => ({ source: source ?? '' }),
})
