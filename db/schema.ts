import { pgTable, text, timestamp, uuid, boolean, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  hashedPassword: text('hashed_password'),
  isDefaultUser: boolean('is_default_user').default(false).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  fileHash: text('file_hash').notNull(),
  fileType: text('file_type'),
  fileSize: integer('file_size'),
  totalPages: integer('total_pages'),
  originalContent: text('original_content'),
  parsedContent: text('parsed_content'),
  corrections: text('corrections'), // JSON string of corrections
  status: text('status').default('pending').notNull(), // Using text instead of enum for simplicity
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const knowledges = pgTable('knowledges', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(),
  tags: text('tags').array(), // Store tags as a text array
  userId: uuid('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  knowledges: many(knowledges)
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id]
  })
}));

export const knowledgesRelations = relations(knowledges, ({ one }) => ({
  user: one(users, {
    fields: [knowledges.userId],
    references: [users.id]
  })
}));
