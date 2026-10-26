import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const cards = sqliteTable('cards', { id: text('id').primaryKey(), data: text('data').notNull() });

export const settings = sqliteTable('settings', { key: text('key').primaryKey(), value: text('value').notNull() });
export const threads = sqliteTable('threads', { id: text('id').primaryKey(), data: text('data').notNull() });
export const asks = sqliteTable('asks', { id: text('id').primaryKey(), data: text('data').notNull() });
