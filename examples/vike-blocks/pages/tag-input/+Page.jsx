// The tag-input block demo. Each field is the `tag-input` block rendered through the registry
// (resolvePage + <Blocks>). A token field for selecting MANY values — the multi-value counterpart to
// the single-select combobox. Type + Enter (or comma) adds a chip, Backspace on an empty input removes
// the last, a chip's x removes it; a `suggestions` pool drives an autocomplete dropdown (arrow keys +
// Enter, click to add). With a `.name()`, hidden inputs carry the values for a native form submit.
import { definePage, resolvePage, tagInput, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Label = ({ children }) => <div style={{ fontSize: 13, color: 'var(--color-muted)', margin: '1.5rem 0 0.55rem' }}>{children}</div>

const FRAMEWORKS = ['react', 'vue', 'svelte', 'angular', 'solid', 'preact', 'qwik', 'lit']

export default function TagInputPage() {
  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <h1 style={{ marginTop: 0 }}>Tag-input block</h1>
      <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
        A tag / chip multi-select — a token field for selecting many values, filling the multi-value hole the
        single-select <a href="/combobox">combobox</a> leaves. Type + Enter (or comma) adds a chip, Backspace on an
        empty field removes the last, a chip's x removes it. Pass a <code>.suggestions()</code> pool for autocomplete.
        With <code>.name()</code>, hidden inputs carry the values for a native submit.
      </p>

      <Label>Free-form tags (type + Enter or comma)</Label>
      {Show([tagInput().value(['design', 'urgent']).placeholder('Add a label...')])}

      <Label>With autocomplete suggestions</Label>
      {Show([tagInput().value(['react']).suggestions(FRAMEWORKS).placeholder('Add a framework...').name('frameworks')])}

      <Label>Wrapped in a field (label + description)</Label>
      {Show([
        field('Topics')
          .description('Press Enter to add. Choose from the suggestions or type your own.')
          .control(tagInput().suggestions(['typescript', 'testing', 'performance', 'accessibility', 'security']).placeholder('Add a topic...')),
      ])}

      <Label>Capped at 3 tags (.max)</Label>
      {Show([tagInput().value(['one', 'two']).max(3).placeholder('Up to 3...')])}

      <Label>Disabled (chips are read-only)</Label>
      {Show([tagInput().value(['locked', 'read-only']).disabled()])}

      <p style={{ marginTop: '1.75rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
