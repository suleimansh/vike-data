// The list `?query=` parser/validator now lives in vike-crud's framework-agnostic core;
// vike-admin consumes it (one implementation, no drift). Re-exported here so the admin's
// own modules and tests keep importing `./query.js`.
export * from 'vike-crud/query'
