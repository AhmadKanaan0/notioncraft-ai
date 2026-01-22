import { pgTable, uuid, text, jsonb, integer, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const pages = pgTable('pages', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    title: text('title').default('Untitled').notNull(),
    content: jsonb('content').default({}),
    icon: text('icon'),
    coverImage: text('cover_image'),
    parentId: uuid('parent_id').references((): any => pages.id),
    position: integer('position').default(0).notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    isFavorite: boolean('is_favorite').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    name: text('name').notNull(),
    color: text('color').default('#6B7280').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const pageTags = pgTable('page_tags', {
    pageId: uuid('page_id').references(() => pages.id).notNull(),
    tagId: uuid('tag_id').references(() => tags.id).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.pageId, t.tagId] }),
}));
