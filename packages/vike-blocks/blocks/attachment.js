// The `attachment` block — a file-upload form control: a drop zone (click or drag) plus the list of
// selected / declared files, defined through the defineBlock seam. `attachment(label)` sets the
// drop-zone prompt; `.accept(...)` restricts file types, `.multiple()` allows many, `.disabled()`
// disables it, `.name()` sets the form name, `.files([...])` declares pre-selected attachments to
// render (each `{ name, size, type }`). The renderer lists its own selection (local UI state, like
// switch/slider); the actual UPLOAD is the data/actions axis (#385).
//
//   attachment().accept('image/*').multiple()
//   attachment('Drop your resume').accept('.pdf,.doc')
//   attachment('Attachments').files([{ name: 'report.pdf', size: 248000 }])
import { defineBlock } from '../core/registry.js'

export const attachment = defineBlock('attachment', {
  build: (label) => (label !== undefined ? { label } : {}),
  refine: {
    accept: (a) => ({ accept: a }),
    multiple: () => ({ multiple: true }),
    disabled: () => ({ disabled: true }),
    name: (n) => ({ name: n }),
    files: (f) => ({ files: f }),
  },
})
