import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const settings = sqliteTable('settings', { id: integer('id').primaryKey(), value: text('value').notNull() });
export const comments = sqliteTable('comments', { id: text('id').primaryKey(), name: text('name').notNull(), message: text('message').notNull(), createdAt: text('created_at').notNull() });
export const photos = sqliteTable('photos', { sortOrder: integer('sort_order').notNull().default(0), id: text('id').primaryKey(), caption: text('caption').notNull(), createdAt: text('created_at').notNull() });
export const rateLimits = sqliteTable('rate_limits', { key: text('key').primaryKey(), count: integer('count').notNull(), expires: integer('expires').notNull() });
