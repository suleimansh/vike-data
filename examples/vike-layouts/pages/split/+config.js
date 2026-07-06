// Per-page override to the CUSTOM `split` shell (registered in ../shells/register.js), and a value
// for its custom `aside` slot — declared in the app +config.js meta so Vike collects it here.
export default {
  layout: 'split',
  aside: 'Anything a shell declares as a slot can be filled from config, just like the built-in logo or nav.',
}
