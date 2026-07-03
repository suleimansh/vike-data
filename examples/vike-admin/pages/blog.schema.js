// The app's OWN schema: two tables the demo administers. Declared once through the neutral
// vike-schema DSL and contributed to the cumulative `schemas` config point (+config.js), exactly
// like an extension contributes its tables. vike-admin reads this composed schema to DERIVE the
// list columns and form fields for any resource that omits them — "declare intent (the schema),
// derive implementation (the admin UI)".
//
// `posts.author_id` references `users.id` — a table vike-auth declared. vike-admin introspects
// that FK and renders the author field as a picker of users (labeled by the users resource's
// recordTitle), the payoff of a single composed schema across extensions.
import { defineSchema } from '@vike-data/vike-schema/schema'

export const postsSchema = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.string('body').nullable()
  t.boolean('published').default(false)
  t.uuid('author_id').references('users.id', { onDelete: 'set null' }).nullable()
  t.timestamps() // created_at + updated_at
})

export const tagsSchema = defineSchema('tags', (t) => {
  t.uuid('id').primary()
  t.string('name')
  t.string('slug').unique()
  t.timestamps()
})

export default [postsSchema, tagsSchema]
