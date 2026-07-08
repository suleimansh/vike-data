// The app's OWN table, declared once through the neutral vike-schema DSL and contributed to the
// cumulative `schemas` config point (+config.js) exactly like an extension contributes its tables.
// `author_id` references `users.id` (vike-auth's table): the admin introspects that FK and renders
// the author as a user picker; the composed Drizzle schema gets a real Postgres FK.
import { defineSchema } from '@vike-data/vike-schema/schema'

export const announcementsSchema = defineSchema('announcements', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.string('body')
  t.uuid('author_id').references('users.id', { onDelete: 'set null' }).nullable()
  t.timestamps() // created_at + updated_at
})
