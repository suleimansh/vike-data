// Runs on every page, on server + client. The only job here is the side-effect import that
// registers the custom `split` shell (see shells/register.js) before any page selects it.
// A built-in-only app needs no Wrapper at all.
import './shells/register.js'

export default function Wrapper({ children }) {
  return children
}
