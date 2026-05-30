import { Request } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { sprint, sprintIssue } from '../../db/schema/sprint';
import { serviceResponse, ServiceResponse } from '../../utils/serviceResponse';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../../config/db';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

async function getIssueIdsForSprint(sprintId: number): Promise<number[]> {
  const rows = await db
    .select({ issueId: sprintIssue.issueId })
    .from(sprintIssue)
    .where(eq(sprintIssue.sprintId, sprintId));
  return rows.map((r) => r.issueId as number);
}

/* ─── getSprintsService ───────────────────────────────────────────────────── */

export const getSprintsService = async (req: Request): Promise<ServiceResponse> => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);

    const sprints = await db
      .select()
      .from(sprint)
      .where(eq(sprint.projectId, projectId))
      .orderBy(sprint.id);

    const result = await Promise.all(
      sprints.map(async (s) => ({
        ...s,
        issueIds: await getIssueIdsForSprint(s.id),
      }))
    );

    return serviceResponse.success('DATA_FETCHED', result);
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

/* ─── createSprintService ─────────────────────────────────────────────────── */

export const createSprintService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    const { name, goal, startDate, endDate } = req.body as {
      name: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
    };

    if (!name) {
      return serviceResponse.error('VALIDATION_ERROR', { name: 'name is required' }, 400);
    }

    // Only one ACTIVE sprint per project
    const [activeSprint] = await db
      .select({ id: sprint.id })
      .from(sprint)
      .where(and(eq(sprint.projectId, projectId), eq(sprint.status, 'ACTIVE')))
      .limit(1);

    if (activeSprint) {
      return serviceResponse.error('ACTIVE_SPRINT_EXISTS', { message: 'A sprint is already active for this project' }, 409);
    }

    const [inserted] = await db
      .insert(sprint)
      .values({
        projectId,
        name,
        goal: goal ?? null,
        status: 'PLANNING',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      })
      .returning();

    return serviceResponse.success('SPRINT_CREATED', { ...inserted, issueIds: [] }, 201);
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

/* ─── updateSprintService ─────────────────────────────────────────────────── */

export const updateSprintService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, goal, startDate, endDate } = req.body as {
      name?: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
    };

    const [existing] = await db.select().from(sprint).where(eq(sprint.id, id)).limit(1);
    if (!existing) {
      return serviceResponse.error('SPRINT_NOT_FOUND', { message: 'Sprint not found' }, 404);
    }

    const updateData: Partial<typeof sprint.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (goal !== undefined) updateData.goal = goal;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    const [updated] = await db
      .update(sprint)
      .set(updateData)
      .where(eq(sprint.id, id))
      .returning();

    const issueIds = await getIssueIdsForSprint(id);
    return serviceResponse.success('SPRINT_UPDATED', { ...updated, issueIds });
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

/* ─── startSprintService ──────────────────────────────────────────────────── */

export const startSprintService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const [existing] = await db.select().from(sprint).where(eq(sprint.id, id)).limit(1);
    if (!existing) {
      return serviceResponse.error('SPRINT_NOT_FOUND', { message: 'Sprint not found' }, 404);
    }

    if (existing.status === 'ACTIVE') {
      return serviceResponse.error('SPRINT_ALREADY_ACTIVE', { message: 'Sprint is already active' }, 409);
    }

    if (existing.status === 'COMPLETED') {
      return serviceResponse.error('SPRINT_COMPLETED', { message: 'Cannot start a completed sprint' }, 409);
    }

    // Check no other ACTIVE sprint for the same project
    const [activeSprint] = await db
      .select({ id: sprint.id })
      .from(sprint)
      .where(
        and(
          eq(sprint.projectId, existing.projectId as number),
          eq(sprint.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (activeSprint) {
      return serviceResponse.error('ACTIVE_SPRINT_EXISTS', { message: 'Another sprint is already active for this project' }, 409);
    }

    const now = new Date();
    const [updated] = await db
      .update(sprint)
      .set({
        status: 'ACTIVE',
        startDate: existing.startDate ?? now,
      })
      .where(eq(sprint.id, id))
      .returning();

    const issueIds = await getIssueIdsForSprint(id);
    return serviceResponse.success('SPRINT_STARTED', { ...updated, issueIds });
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

/* ─── completeSprintService ───────────────────────────────────────────────── */

export const completeSprintService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const [existing] = await db.select().from(sprint).where(eq(sprint.id, id)).limit(1);
    if (!existing) {
      return serviceResponse.error('SPRINT_NOT_FOUND', { message: 'Sprint not found' }, 404);
    }

    if (existing.status !== 'ACTIVE') {
      return serviceResponse.error('SPRINT_NOT_ACTIVE', { message: 'Only an active sprint can be completed' }, 409);
    }

    const now = new Date();
    const [updated] = await db
      .update(sprint)
      .set({
        status: 'COMPLETED',
        endDate: existing.endDate ?? now,
      })
      .where(eq(sprint.id, id))
      .returning();

    const issueIds = await getIssueIdsForSprint(id);
    return serviceResponse.success('SPRINT_COMPLETED', { ...updated, issueIds });
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

/* ─── deleteSprintService ─────────────────────────────────────────────────── */

export const deleteSprintService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const [existing] = await db.select().from(sprint).where(eq(sprint.id, id)).limit(1);
    if (!existing) {
      return serviceResponse.error('SPRINT_NOT_FOUND', { message: 'Sprint not found' }, 404);
    }

    if (existing.status !== 'PLANNING') {
      return serviceResponse.error('SPRINT_NOT_DELETABLE', { message: 'Only PLANNING sprints can be deleted' }, 409);
    }

    await db.delete(sprint).where(eq(sprint.id, id));

    return serviceResponse.success('SPRINT_DELETED', { id });
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

/* ─── addIssuesToSprintService ────────────────────────────────────────────── */

export const addIssuesToSprintService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const sprintId = parseInt(req.params.id as string, 10);
    const { issueIds } = req.body as { issueIds: number[] };

    if (!Array.isArray(issueIds) || issueIds.length === 0) {
      return serviceResponse.error('VALIDATION_ERROR', { issueIds: 'issueIds must be a non-empty array' }, 400);
    }

    const [existingSprint] = await db.select({ id: sprint.id }).from(sprint).where(eq(sprint.id, sprintId)).limit(1);
    if (!existingSprint) {
      return serviceResponse.error('SPRINT_NOT_FOUND', { message: 'Sprint not found' }, 404);
    }

    // Insert with ON CONFLICT DO NOTHING to ignore duplicates
    await db.execute(
      sql`INSERT INTO sprint_issue (sprint_id, issue_id)
          SELECT ${sprintId}, unnest(ARRAY[${sql.raw(issueIds.join(','))}]::bigint[])
          ON CONFLICT DO NOTHING`
    );

    const updatedIssueIds = await getIssueIdsForSprint(sprintId);
    return serviceResponse.success('ISSUES_ADDED', { sprintId, issueIds: updatedIssueIds });
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

/* ─── removeIssueFromSprintService ───────────────────────────────────────── */

export const removeIssueFromSprintService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const sprintId = parseInt(req.params.id as string, 10);
    const issueId = parseInt(req.params.issueId as string, 10);

    await db
      .delete(sprintIssue)
      .where(and(eq(sprintIssue.sprintId, sprintId), eq(sprintIssue.issueId, issueId)));

    return serviceResponse.success('ISSUE_REMOVED', { sprintId, issueId });
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};
