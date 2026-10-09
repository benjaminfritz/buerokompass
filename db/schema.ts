import { sqliteTable,text,integer,primaryKey,uniqueIndex } from 'drizzle-orm/sqlite-core';
export const jobs=sqliteTable('jobs',{
 id:text('id').primaryKey(),owner:text('owner').notNull(),url:text('url').notNull(),title:text('title').notNull(),company:text('company').notNull(),location:text('location').notNull(),source:text('source').notNull(),employment:text('employment').notNull(),salary:text('salary').notNull(),addedAt:text('added_at').notNull(),kind:text('kind').notNull(),
},t=>[uniqueIndex('idx_jobs_owner_url').on(t.owner,t.url)]);
export const jobState=sqliteTable('job_state',{
 owner:text('owner').notNull(),jobId:text('job_id').notNull(),seen:integer('seen').notNull().default(0),favorite:integer('favorite').notNull().default(0),dismissed:integer('dismissed').notNull().default(0)
},t=>[primaryKey({columns:[t.owner,t.jobId]})]);
