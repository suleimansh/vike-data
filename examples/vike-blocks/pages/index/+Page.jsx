// The catalog landing: a gallery of the built-in blocks, each linking to its demo page. This page
// is plain app chrome (not composed of blocks) — a directory into the demos.
const catalog = [
  { name: 'Tabs', href: '/tabs', tag: 'interactive', desc: 'Tabs with a sliding highlight and animated panels. Each panel composes other blocks.' },
  { name: 'Accordion', href: '/accordion', tag: 'interactive', desc: 'Expand/collapse sections with an animated height morph. Single or multi-open; each panel composes other blocks.' },
  { name: 'Collapsible', href: '/collapsible', tag: 'interactive', desc: 'A single expand/collapse disclosure (shadcn Collapsible) — one trigger toggles one panel of nested blocks. The single-panel sibling of the accordion; same dep-free height morph. Starts open with .open().' },
  { name: 'Dialog', href: '/dialog', tag: 'interactive', desc: 'A modal overlay with a portal, focus trap, Escape / outside-click, and scroll-lock. Dep-free; holds nested blocks.' },
  { name: 'Confirm', href: '/confirm', tag: 'interactive', desc: 'An alert dialog guarding a destructive action (shadcn AlertDialog) — a themed replacement for window.confirm. Owns a real form so it still submits with no JS; hydrated, the submit is gated behind the dialog. Or navigates on confirm.' },
  { name: 'Sheet', href: '/sheet', tag: 'interactive', desc: 'A side panel anchored to a screen edge (right / left / top / bottom), sliding in. Shares the dialog overlay; holds nested blocks.' },
  { name: 'Drawer', href: '/drawer', tag: 'interactive', desc: 'An edge-anchored panel with a drag-to-dismiss grabber (default bottom). Drag the handle toward the edge to flick it closed.' },
  { name: 'Card', href: '/card', tag: 'container', desc: 'A bordered surface with an optional header + footer, wrapping nested blocks. The most-used building block; cards compose recursively.' },
  { name: 'Field', href: '/field', tag: 'container', desc: 'A form-field shell: a label + control slot + description + error, wrapping a control block. The hand-authored field shell that schema forms share.' },
  { name: 'Form', href: '/form', tag: 'container', desc: 'A non-schema form: group field + control blocks in a real, ready-to-post <form> with a submit button. Native HTML POST (method / action) — works with progressive enhancement, zero client JS. The create/edit workhorse.' },
  { name: 'Attachment', href: '/attachment', tag: 'form', desc: 'A file-upload control — a dashed drop zone (click or drag) plus a removable list of selected files. accept / multiple, theme-native.' },
  { name: 'Headings', href: '/heading', tag: 'leaf', desc: 'Six levels (h1-h6) with level-scaled top spacing, so sections breathe. Theme-native text color.' },
  { name: 'Alert', href: '/alert', tag: 'leaf', desc: 'The shadcn Radix alert — a bordered notice with an accent icon, title, and description; info / success / warning / danger. Dep-free.' },
  { name: 'Button', href: '/button', tag: 'leaf', desc: 'The shadcn Base button — six variants, four sizes, focus ring + disabled, optional declarative nav.' },
  { name: 'Input', href: '/input', tag: 'form', desc: 'A from-scratch text input — type / placeholder / value / disabled, a focus-visible ring, theme-native. Pairs with field.' },
  { name: 'Textarea', href: '/textarea', tag: 'form', desc: 'A from-scratch multi-line input — placeholder / rows / value / disabled, resizable, a focus-visible ring. Composes inside a field.' },
  { name: 'Checkbox', href: '/checkbox', tag: 'form', desc: 'A dep-free boolean control with an animated check — click to toggle. label / checked / disabled, theme-native. Pairs with field.' },
  { name: 'Radio', href: '/radio', tag: 'form', desc: 'A dep-free radio group with an animated selection — pick one option and the dot springs in. option / value / disabled, theme-native.' },
  { name: 'Select', href: '/select', tag: 'form', desc: 'A theme-native single-choice control over a native <select> (shadcn Base native-select) — the browser chevron replaced by ours. option / placeholder / value / disabled. Pairs with field.' },
  { name: 'Tag-input', href: '/tag-input', tag: 'form', desc: 'A tag / chip multi-select token field — add and remove chips, with optional autocomplete suggestions. Type + Enter (or comma) adds, Backspace removes the last, a chip x removes it. Hidden inputs carry the values for a native submit. The multi-value counterpart to the single-select combobox.' },
  { name: 'Combobox', href: '/combobox', tag: 'form', desc: 'A searchable single-select (shadcn combobox) — a popover with a filter input and a listbox, arrow-key + Enter nav, empty state. A hidden input carries the value. Reuses usePopover.' },
  { name: 'Switch', href: '/switch', tag: 'form', desc: 'A dep-free toggle with an animated sliding thumb — click to flip. label / checked / disabled, theme-native. Builder is toggle().' },
  { name: 'Toggle', href: '/toggle', tag: 'form', desc: 'A pressable on/off button (toggleButton) plus a segmented control (toggleGroup) — the shadcn Toggle / ToggleGroup toolbar + segmented-select staple. Single-select (click again to clear) or .multiple(). aria-pressed, theme-native. Distinct from switch (a form boolean).' },
  { name: 'Slider', href: '/slider', tag: 'form', desc: 'A dep-free range control — drag the thumb, click the rail, or arrow-key it. min / max / step / value, theme-native. Pairs with field.' },
  { name: 'Calendar', href: '/calendar', tag: 'form', desc: 'A dep-free month grid (no date lib) — step months, click a day. value / min / max / weekStartsOn, theme-native. Feeds date-picker.' },
  { name: 'Date-picker', href: '/date-picker', tag: 'form', desc: 'A calendar in a popover — click the input-like trigger to open the grid, pick a day to fill it. Outside-click / Escape close. Reuses usePopover.' },
  { name: 'Popover', href: '/popover', tag: 'interactive', desc: 'A trigger that opens a floating panel of arbitrary content anchored to it (the general-purpose sibling of the dropdown menu). Holds any nested blocks — a form, a card, copy. Edge-aware flip, outside-click / Escape close. Reuses usePopover.' },
  { name: 'Dropdown-menu', href: '/dropdown', tag: 'interactive', desc: 'A trigger that opens a floating menu of items (links or buttons) anchored below it. Arrow-key nav, outside-click / Escape close. Reuses usePopover.' },
  { name: 'Command', href: '/command', tag: 'interactive', desc: 'A ⌘K command palette (shadcn command) on the Overlay primitive — a trigger + global ⌘K hotkey open a modal with a filter input over grouped items, arrow-key + Enter to run (navigates), shortcut hints. Dep-free; SSR renders the trigger only.' },
  { name: 'Navigation-menu', href: '/nav-menu', tag: 'interactive', desc: 'A horizontal bar of links + dropdown sections (title + description per link), one open at a time. Arrow-key nav, outside-click / Escape close.' },
  { name: 'Breadcrumb', href: '/breadcrumb', tag: 'leaf', desc: 'The trail of pages to the current one (shadcn breadcrumb) — nav > ol of crumbs, the last one the current page (aria-current), chevron separators. Plain links, works with no client JS.' },
  { name: 'Doc-nav', href: '/doc-nav', tag: 'interactive', desc: 'A documentation sidebar tree — collapsible categories, page links, active + relevant state, and an on-page section splice under the active page. Pairs with the docs layout shell; the sidebar half of DocPress-on-the-IR (#420). Plain links, works with no client JS.' },
  { name: 'Tree-view', href: '/tree-view', tag: 'interactive', desc: 'An arbitrary-depth nested hierarchy — file explorer, folder tree, org chart, nested settings. Per-branch expand/collapse, active highlighting via .current (auto-opens the branch holding it), roving arrow-key focus. Generalizes doc-nav to any depth. A leaf with an href is a real link, works with no client JS.' },
  { name: 'Toast', href: '/toast', tag: 'interactive', desc: 'Transient notifications fired imperatively (Sonner-style) — toast("Saved") / toast.success(...). Stack in a corner, auto-dismiss, closeable. Mount <Toaster> once.' },
  { name: 'Tooltip', href: '/tooltip', tag: 'interactive', desc: 'A small label revealed on hover / focus (shadcn Radix tooltip, reimplemented pure-CSS) — wraps any block via .on(), places top/bottom/left/right, dark tip + arrow. No portal, no JS, no state; works with no client JS.' },
  { name: 'Kbd', href: '/kbd', tag: 'leaf', desc: 'Keyboard key caps for documenting shortcuts — kbd("Esc") or kbd(["Cmd", "K"]). Static, theme-native.' },
  { name: 'Item', href: '/item', tag: 'leaf', desc: 'A reusable list row — leading media + title + description + trailing note. Composes in any container. Theme-native.' },
  { name: 'Avatar', href: '/avatar', tag: 'leaf', desc: 'A user image with an initials fallback (shadcn Radix avatar) — the image hides itself on load error to reveal initials, then a user icon. Size / circle-or-square / a status dot, and an overlapping group with a +N count.' },
  { name: 'Bubble', href: '/bubble', tag: 'leaf', desc: 'A chat message bubble, sender-aligned (user / assistant). Holds text or nested blocks (markdown). For AI chat UIs.' },
  { name: 'Message', href: '/message', tag: 'container', desc: 'A chat message — a bubble plus avatar, author, and timestamp, aligned by sender. Composes the bubble block.' },
  { name: 'Message scroller', href: '/message-scroller', tag: 'interactive', desc: 'A scroll container for a chat transcript — sticks to the bottom on load, with a jump-to-latest button. Holds messages.' },
  { name: 'Chart', href: '/chart', tag: 'leaf', desc: 'A dep-free SVG chart (bar / line / area) driven by a data series. type / height / color / max, theme-native, responsive. Rich charts stay a custom block.' },
  { name: 'Skeleton', href: '/skeleton', tag: 'leaf', desc: 'A pulsing placeholder shown while content loads (shadcn skeleton). width / height / .circle(size) / .radius() / .lines(n); pure-CSS pulse, no JS, respects prefers-reduced-motion. Compose several to mock a card/list/form.' },
  { name: 'Progress', href: '/progress', tag: 'leaf', desc: 'A determinate or indeterminate progress bar (shadcn progress) — pure-CSS fill or an animated segment. value / max / .size() / .indeterminate() / .label() caption row. Theme-native (fill reads --color-primary).' },
  { name: 'Spinner', href: '/spinner', tag: 'leaf', desc: 'A loading spinner for indeterminate waits — a ring with a rotating arc, the companion to skeleton (placeholder) and progress (bar). .size() / .tone() / .label(); pure-CSS spin, no JS, role=status, respects prefers-reduced-motion.' },
  { name: 'Empty-state', href: '/empty-state', tag: 'container', desc: 'The "no results / get started" surface for a table or list — an illustration medallion, a title, a description, and an optional row of action blocks. Draws a built-in icon or any block you pass to .icon(). Composes nested blocks.' },
  { name: 'Data-table', href: '/data-table', tag: 'interactive', desc: 'The plain table upgraded into a data table — a search filter, row selection (a checkbox column + select-all), and column-visibility controls, each opt-in. Reuses the table chrome; the plain-data counterpart to the schema-driven list.' },
  { name: 'Table', href: '/table', tag: 'interactive', desc: 'A non-schema data table — feed it rows + columns directly (API results, computed data). String or { key, label, align, format } columns, click-to-sort, empty state. The plain-data counterpart to the schema-driven list.' },
  { name: 'Pagination', href: '/pagination', tag: 'interactive', desc: 'Page navigation for a list/table (shadcn Pagination) — the active page outlined + aria-current, chevron Prev/Next, ellipsis gaps. Each page is a real <a href> built from a {page} template, so paging works with no client JS. Owns the page-range math.' },
  { name: 'Timeline', href: '/timeline', tag: 'leaf', desc: 'A vertical activity feed / history (Ant Timeline) — a rail of tone-colored dots joined by connectors, each event a title + optional time + a string or nested-block body. The audit-log / order-status / changelog surface. Dep-free, theme-native.' },
  { name: 'Code block', href: '/code', tag: 'interactive', desc: 'A code snippet with a filename header, copy button, line numbers, and highlight / diff / focus decorations (builder or inline markers). Dep-free tokenizer, no Shiki.' },
  { name: 'Stat', href: '/stat', tag: 'leaf', desc: 'A KPI / metric tile — a title over a single value. A bespoke block (no builder): { block: "stat", title, value }, the shape a dashboard query emits. Compose several in a metrics row.' },
  { name: 'Markdown', href: '/markdown', tag: 'leaf', desc: 'A leaf for a markdown source string. The built-in renderer is an MVP (prints the source verbatim, zero deps); register a real markdown renderer to format it. For AI/chat bodies and long-form copy.' },
  { name: 'Primitives', href: '/primitives', tag: 'leaf', desc: 'heading · text (lead / muted / blockquote / code) · badge · list · divider · link — the built-in leaf blocks, composed with definePage.' },
  { name: 'Custom blocks', href: '/raw', tag: 'extend', desc: 'Define your own with defineBlock, or author a page as plain { block, ...props } descriptors.' },
]

// Domain grouping: the catalog above stays a flat map (by href); this orders it into sections.
const byHref = Object.fromEntries(catalog.map((c) => [c.href, c]))
const SECTIONS = [
  { label: 'Forms & inputs', hrefs: ['/button', '/input', '/textarea', '/checkbox', '/radio', '/select', '/combobox', '/tag-input', '/switch', '/toggle', '/slider', '/calendar', '/date-picker', '/attachment', '/field', '/form'] },
  { label: 'Overlays & menus', hrefs: ['/dialog', '/confirm', '/sheet', '/drawer', '/popover', '/dropdown', '/command', '/nav-menu', '/tooltip'] },
  { label: 'Navigation', hrefs: ['/breadcrumb', '/doc-nav', '/pagination', '/tabs'] },
  { label: 'Layout & containers', hrefs: ['/card', '/accordion', '/collapsible'] },
  { label: 'Data display', hrefs: ['/table', '/data-table', '/chart', '/stat', '/avatar', '/item', '/code', '/timeline'] },
  { label: 'Feedback & status', hrefs: ['/alert', '/toast', '/progress', '/spinner', '/skeleton', '/empty-state'] },
  { label: 'Content & typography', hrefs: ['/heading', '/markdown', '/kbd', '/primitives'] },
  { label: 'Chat & AI', hrefs: ['/bubble', '/message', '/message-scroller'] },
  { label: 'Extend', hrefs: ['/raw'] },
]

const cardStyle = {
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  padding: '1.1rem 1.2rem',
  background: 'var(--color-surface)',
}

function BlockCard({ c }) {
  return (
    <a href={c.href} className="vb-card" style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{c.name}</span>
        <span style={{ fontSize: 11, color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: 999, padding: '1px 8px' }}>{c.tag}</span>
      </div>
      <p style={{ margin: '0 0 0.85rem', fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.5 }}>{c.desc}</p>
      <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>View demo -&gt;</span>
    </a>
  )
}

export default function CatalogPage() {
  return (
    <div style={{ maxWidth: 980, margin: '2rem auto', padding: '0 1.25rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <style>{'.vb-card{transition:border-color .15s ease, transform .15s ease}.vb-card:hover{border-color:var(--color-primary);transform:translateY(-2px)}'}</style>
      <header style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 30, margin: '0 0 0.4rem' }}>vike-blocks</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 16, margin: 0, lineHeight: 1.5 }}>
          Composable UI as data — a page is a composition of blocks. {catalog.length} blocks, by domain:
        </p>
      </header>
      {SECTIONS.map((section) => (
        <section key={section.label} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)', margin: '0 0 0.9rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
            {section.label}
            <span style={{ marginLeft: '0.5rem', fontWeight: 400 }}>{section.hrefs.length}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {section.hrefs.map((href) => byHref[href] && <BlockCard key={href} c={byHref[href]} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
