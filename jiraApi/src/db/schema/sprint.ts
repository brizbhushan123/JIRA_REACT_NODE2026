import { pgTable, bigserial, bigint, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { project } from '../schema';
import { jiraissue } from '../schema';

export const sprint = pgTable('sprint', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  projectId: bigint('project_id', { mode: 'number' }).references(() => project.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  goal: text('goal'),
  status: varchar('status', { length: 50 }).notNull().default('PLANNING'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sprintIssue = pgTable('sprint_issue', {
  sprintId: bigint('sprint_id', { mode: 'number' }).references(() => sprint.id, { onDelete: 'cascade' }),
  issueId: bigint('issue_id', { mode: 'number' }).references(() => jiraissue.id, { onDelete: 'cascade' }),
});
