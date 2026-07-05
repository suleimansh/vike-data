// Type declarations for the vike-blocks core (the `.` entry).
//
// vike-blocks is authored in plain JS; these hand-written types give editors and AI
// agents autocomplete + inference over the seams that matter most: the definePage
// composer, the open registry, the describeBlock discovery manifest, the defineBlock
// authoring seam, and the descriptor/builder shapes. The ~90 built-in builders share
// one chainable `Builder` return (their per-block refinements are dynamic); enumerate
// a block's actual params at runtime with describeBlock().

/** A resolved, serializable block descriptor: `{ block, ...props }`. */
export interface Block {
  block: string
  [prop: string]: unknown
}

/** A chainable block builder. Each refinement returns the builder; `.build()` collapses it. */
export interface Builder {
  /** Collapse the fluent chain to a `{ block, ...props }` descriptor. */
  build(): Block
  [method: string]: (...args: any[]) => any
}

/** A page section: a block descriptor, a fluent builder, or a bespoke `{ block, ... }` object. */
export type Section = Block | Builder | Record<string, unknown>

/** The config passed to definePage. `sections` is the ordered list of blocks. */
export interface PageConfig {
  route?: string
  sections?: Section[]
  [key: string]: unknown
}

/** An opaque page produced by definePage and consumed by resolvePage. */
export interface Page {
  [key: string]: unknown
}

/** One resolved section: the block type, its props, and the serializable view-model. */
export interface ResolvedSection {
  block: string
  props: Record<string, unknown>
  resolved: unknown
}

/** A page whose sections have been resolved to serializable view-models. */
export interface ResolvedPage {
  sections: ResolvedSection[]
  [key: string]: unknown
}

/** Compose a page from block descriptors/builders. */
export function definePage(config: PageConfig): Page
/** Resolve a page's descriptors into plain, serializable view-models a renderer draws. */
export function resolvePage(page: Page, tables?: unknown): ResolvedPage

/** Context passed to a block's resolve step. */
export interface ResolveContext {
  props: Record<string, unknown>
  tables?: unknown
}

/** A block definition passed to registerBlock. */
export interface BlockDef {
  resolve?: (ctx: ResolveContext) => unknown
  params?: ParamDescriptor[]
  builder?: BuilderMeta
}

/** A registry entry as stored/returned by getBlock. */
export interface BlockEntry {
  type: string
  resolve: ((ctx: ResolveContext) => unknown) | null
  params: ParamDescriptor[] | null
  builder: BuilderMeta | null
}

/** An author-declared param descriptor surfaced by describeBlock. */
export interface ParamDescriptor {
  name: string
  required?: boolean
  [key: string]: unknown
}

/** The fluent builder surface of a defineBlock block. */
export interface BuilderMeta {
  /** The chainable refinement method names. */
  methods: string[]
  /** The positional argument count of the builder factory. */
  arity: number
}

/** A block descriptor for programmatic discovery (describeBlock / describeBlocks). */
export interface BlockManifest {
  type: string
  /** True when the block has no resolve step (its model is its props). */
  passThrough: boolean
  builder: BuilderMeta | null
  params: ParamDescriptor[] | null
}

/** Register (or override) a block type. */
export function registerBlock(type: string, def?: BlockDef): BlockDef
/** Get a registry entry, or null if the type is not registered. */
export function getBlock(type: string): BlockEntry | null
/** True when a block type is registered. */
export function hasBlock(type: string): boolean
/** Every registered block type. */
export function listBlocks(): string[]
/** Describe a registered block for programmatic discovery, or null for an unknown type. */
export function describeBlock(type: string): BlockManifest | null
/** The whole catalog as descriptors. */
export function describeBlocks(): BlockManifest[]

/** Options for defineBlock: the builder factory, its refinements, an optional resolve + params. */
export interface DefineBlockDef {
  build?: (...args: any[]) => Record<string, unknown>
  refine?: Record<string, (...args: any[]) => Record<string, unknown>>
  resolve?: (ctx: ResolveContext) => unknown
  params?: ParamDescriptor[]
}

/** Define a block (builder + descriptor + registry entry) in one call. Returns the builder factory. */
export function defineBlock(type: string, def?: DefineBlockDef): (...args: any[]) => Builder

/** Resolve `$scope.path` tokens in a props object against a context. */
export function resolveParams(...args: any[]): any
/** Resolve a single token value against a context. */
export function resolveToken(...args: any[]): any

// --- The built-in block builders. Each returns a chainable Builder; use describeBlock(type)
// --- to enumerate a specific block's refinements and params at runtime.
export function text(...args: any[]): Builder
export function heading(...args: any[]): Builder
export function badge(...args: any[]): Builder
export function divider(...args: any[]): Builder
export function link(...args: any[]): Builder
export function list(...args: any[]): Builder
export function button(...args: any[]): Builder
export function input(...args: any[]): Builder
export function textarea(...args: any[]): Builder
export function checkbox(...args: any[]): Builder
export function radio(...args: any[]): Builder
export function select(...args: any[]): Builder
export function combobox(...args: any[]): Builder
export function tagInput(...args: any[]): Builder
export function toggle(...args: any[]): Builder
export function toggleButton(...args: any[]): Builder
export function toggleGroup(...args: any[]): Builder
export function slider(...args: any[]): Builder
export function calendar(...args: any[]): Builder
export function datePicker(...args: any[]): Builder
export function dropdown(...args: any[]): Builder
export function popover(...args: any[]): Builder
export function navMenu(...args: any[]): Builder
export function kbd(...args: any[]): Builder
export function item(...args: any[]): Builder
export function bubble(...args: any[]): Builder
export function message(...args: any[]): Builder
export function messageScroller(...args: any[]): Builder
export function chart(...args: any[]): Builder
export function alert(...args: any[]): Builder
export function tabs(...args: any[]): Builder
export function accordion(...args: any[]): Builder
export function collapsible(...args: any[]): Builder
export function dialog(...args: any[]): Builder
export function confirm(...args: any[]): Builder
export function sheet(...args: any[]): Builder
export function drawer(...args: any[]): Builder
export function card(...args: any[]): Builder
export function emptyState(...args: any[]): Builder
export function field(...args: any[]): Builder
export function form(...args: any[]): Builder
export function attachment(...args: any[]): Builder
export function code(...args: any[]): Builder
export function markdown(...args: any[]): Builder
export function table(...args: any[]): Builder
export function dataTable(...args: any[]): Builder
export function timeline(...args: any[]): Builder
export function pagination(...args: any[]): Builder
export function tooltip(...args: any[]): Builder
export function avatar(...args: any[]): Builder
export function avatarGroup(...args: any[]): Builder
export function skeleton(...args: any[]): Builder
export function progress(...args: any[]): Builder
export function spinner(...args: any[]): Builder
export function breadcrumb(...args: any[]): Builder
export function command(...args: any[]): Builder
export function layout(...args: any[]): Builder
export function slot(...args: any[]): Builder
export function docNav(...args: any[]): Builder
export function tree(...args: any[]): Builder
export function contextMenu(...args: any[]): Builder
export function stepper(...args: any[]): Builder
export function descriptionList(...args: any[]): Builder
export function rating(...args: any[]): Builder

// --- toast: an imperative API (not a `sections` block), rendered by a mounted <Toaster>.
export interface ToastOptions {
  intent?: 'info' | 'success' | 'warning' | 'danger'
  [key: string]: unknown
}
export function toast(message: string, options?: ToastOptions): unknown
export function emitToast(...args: any[]): unknown
export function dismissToast(...args: any[]): unknown
export function subscribeToasts(listener: (...args: any[]) => void): () => void

// --- Framework-agnostic helpers re-exported from the block modules.
/** True when a nav item's `href` matches the current path (exact for `/`, boundary-aware otherwise). */
export function isActivePath(currentPath: string, href: string): boolean
export function groupLeveledItems(...args: any[]): any
export function resolveDocNav(...args: any[]): any
export function resolveTree(...args: any[]): any
export function clampMenuPosition(...args: any[]): any
export function stepState(...args: any[]): any
export function ratingValueAt(...args: any[]): any
export function starFill(...args: any[]): any
export function snapRating(...args: any[]): any
