// Param-token resolution (`$row.id` -> the value) lives in vike-blocks, where block descriptors +
// params originate, so the client runner AND the block renderers (e.g. a table's row actions) share
// ONE resolver. Re-exported here for back-compat: `import { resolveParams } from 'vike-actions'`.
export { resolveParams, resolveToken } from 'vike-blocks'
