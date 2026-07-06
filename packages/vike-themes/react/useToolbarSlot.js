// Re-export the canonical hook from vike-toolbar. The resolve + observer + cleanup used to
// be hand-copied here (that copy is how #671's observer leak slipped in); it now has a
// single leak-safe source in vike-toolbar/react so this package can't drift from it (#683).
export { useToolbarSlot } from 'vike-toolbar/react/useToolbarSlot'
