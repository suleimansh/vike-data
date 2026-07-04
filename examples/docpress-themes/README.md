# docpress-themes-example

Spike for [#327](https://github.com/suleimansh/vike-data/issues/327): can `vike-themes` (and `vike-layouts`) be used with [DocPress](https://github.com/brillout/docpress)?

This is a minimal DocPress docs site whose palette is driven live by `vike-themes`. A theme + appearance switcher sits in DocPress' top navigation; picking a brand recompiles the CSS variables and applies them with no reload.

## Run

```bash
# from the repo root
pnpm install
pnpm --filter docpress-themes-example dev
```

Then open the printed URL and use the **Theme** / **Mode** switchers in the top-right.

## How it fits together

| Piece | File | Role |
| --- | --- | --- |
| Agnostic core | `vike-themes` (`themeToAppearanceCss`) | Compiles a brand + appearance to a `body { --color-*: … }` string. Zero framework deps. |
| The switcher | `ThemeMenu.tsx` | Mounted in the **vike-toolbar** settings popover (a `Toolbar` item — see the IR adapter below). Seeds the `<select>` values from the cookie and, on switch, persists the choice and mirrors the new palette onto the head `<style>`. |
| No-flash head script | `headHtml` (in `ThemeMenu.tsx`, wired via `config.headHtml`) | An inline `<head>` script that reads the cookie and applies the palette **before first paint**. It carries the whole brand × appearance palette inlined, so it needs no request and no bundle — it works on both per-request SSR and **prerendered/static** pages (the latter has no request to read a cookie from at render time). This is the single source of truth for the initial palette. |
| The bridge | the head `<style>` (written by `headHtml`) | Maps DocPress' `--dp-color-*` seam onto vike-themes' emitted `--color-*` (e.g. `--dp-color-bg: var(--color-bg)`), **scoped to `body`** (see lesson below). This adapter glue is what belongs in vike-data. |
| Brands | `themes.ts` | Two local brands plus the shipped `emerald` brand. All of them only author `primary`; the core derives `primary-light` / `primary-dark`. |

Note: `vike-themes` is **not** added via `extends` in `+config.ts`. DocPress ships its own renderer (it is not `vike-react`), so vike-themes' `vike-react` `Wrapper` hook would not run. The integration therefore uses the framework-agnostic core directly — which is the honest test of whether that core slots into a foreign render pipeline.

## The IR shell adapter ([#420](https://github.com/suleimansh/vike-data/issues/420))

Beyond the CSS-variable reskin, this example also expresses DocPress's **page shell as `vike-blocks`**, so the renderer is swappable — not just the colors. The block IR stays; only who draws it changes (the same thesis as `vike-mantine`).

| Piece | File | Role |
| --- | --- | --- |
| The shell as a block | `ir/getPageElement.tsx` | Maps DocPress's normalized model (`pageContext.resolved`: `navItemsAll` / `pageTitle` / `isLandingPage`) onto a `layout('docs')` block: the sidebar is a `docNav` block (`groupLeveledItems` folds DocPress's flat, leveled nav list into it), the navbar composes from `link` blocks, the mobile menu is a `dialog` holding the same nav, and the MDX `<Page/>` flows into the article region via `slot('article').from('content')`. |
| The toolbar | `vike-toolbar` (`Toolbar`) | The theme picker lives in a fixed settings popover, not the navbar. Because this app uses a custom renderer (no vike-react `Wrapper` / `bodyHtmlEnd`), the IR shell mounts `vike-toolbar/react`'s `Toolbar` directly with `ThemeMenu` as an item, and `+onRenderHtml` injects the `#vike-toolbar-root` mount node. |
| The seam | `+onRenderHtml.tsx` / `+onRenderClient.tsx` | A thin renderer override (Vike lets an app config override an extended one) that calls the IR `getPageElement` instead of DocPress's `<Layout>`. Non-invasive — no upstream `@brillout/docpress` change. The `<head>` reproduces the essentials for this example (title / favicon / the theme no-flash `headHtml`); a real integration keeps DocPress's full head, which is why the honest long-term seam is an injectable `getPageElement` upstream. |

The theme switcher and no-flash palette are preserved through the swap: `ThemeMenu` is a `vike-toolbar` settings item and `headHtml` is still injected — so a designer can change **structure + components** (swap the renderer per block type) on top of the color reskin.

## The load-bearing lesson

DocPress declares its `--dp-color-*` seam on **`:root`** (and derives internal aliases like `--color-bg-white` from it there). The example sets the brand palette **and** the bridge on **`body`**, which sits below `:root` in the tree — so its declaration is the one every descendant inherits, and the page re-colors. The one catch: `--color-bg-white` is declared only on `:root`, so a body-level `--dp-color-bg` never reaches it; the bridge re-sets `--color-bg-white` on `body` too. Both also load last in `<head>` so they win by source order. That scope-matching is the real adapter requirement, and it is what a per-framework `ThemeProvider` would have to know about DocPress.

## What this proves, and what it does not (measured in a real browser)

- **Works:** with the `body`-scope fix, page background flips `#ffffff` → `#06110c` and body text `#16181d` → `#e7f5ee` across brand + dark mode, content links re-color, and the choice persists across reload via cookie. Live, no reload.
- **Limited:** DocPress hardcodes most colors as `rgba(…)` literals (top nav bar, nav shadows, hover tints, code blocks) and ships no dark stylesheet, so that chrome stays fixed — a dark theme flips the body but leaves the top bar light. A complete integration needs DocPress to tokenize its own palette: a change inside DocPress, which is currently marked "only meant to be used by Vike and Telefunc."
- **Out of scope:** `vike-layouts`. DocPress already owns its shell; the two are competing shell systems, not composable layers, and a docs site does not need per-page shell switching. (Expressing that shell as swappable `vike-blocks` — rather than replacing it with a competing frame — is the separate [#420](https://github.com/suleimansh/vike-data/issues/420) adapter above.)

See the `/coverage` page in the running site for the full caveat write-up.
