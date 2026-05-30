import { Request } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { issuetype, issuestatus, priority, project as projectTbl,jiraissue, jiraaction} from '../../db/schema';
import { user as userSchema } from '../../db/schema/user';
import { toCamelCase } from '../../utils/dbUtils';
import { serviceResponse, ServiceResponse } from '../../utils/serviceResponse';
import { eq, or, ilike, asc, sql, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from '../../config/db';
import { sprint, sprintIssue } from '../../db/schema/sprint';

export const createIssueService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const { projectId, summary, description, issuetypeId, priorityId, assigneeId, duedate, sprintId } = req.body;

    const [projectRow] = await db.select().from(projectTbl).where(eq(projectTbl.id, Number(projectId))).limit(1);
    if (!projectRow) return serviceResponse.error('PROJECT_NOT_FOUND', {}, 404);

    const [todoStatus] = await db.select().from(issuestatus).where(eq(issuestatus.pname, 'To Do')).limit(1);
    if (!todoStatus) return serviceResponse.error('STATUS_NOT_CONFIGURED', {}, 500);

    const countResult = await db
    .select({ cnt: sql<number>`count(*)` })
    .from(jiraissue)
    .where(eq(jiraissue.projectId, Number(projectId)));

    const issueCount = Number(countResult[0]?.cnt ?? 0);
    const issueNum = issueCount + 1;
    const pkey = `${projectRow.pkey}-${issueNum}`;

    const [issue] = await db.insert(jiraissue).values({
      issueNum,
      pkey,
      projectId:     Number(projectId),
      summary,
      description:   description ?? null,
      issuetypeId:   Number(issuetypeId),
      issuestatusId: todoStatus.id!,
      priorityId:    priorityId ? Number(priorityId)  : null,
      assigneeId:    assigneeId ? Number(assigneeId)  : null,
      reporterId:    req.authUser?.id ?? null,
      creatorId:     req.authUser?.id ?? null,
      duedate:       duedate    ? new Date(duedate)   : null,
    }).returning({ id: jiraissue.id, pkey: jiraissue.pkey });

    if (sprintId) {
      const [existingSprint] = await db.select({ id: sprint.id })
        .from(sprint)
        .where(eq(sprint.id, Number(sprintId)))
        .limit(1);
      if (existingSprint) {
        await db.insert(sprintIssue).values({ sprintId: Number(sprintId), issueId: issue.id })
          .onConflictDoNothing();
      }
    }

    return serviceResponse.success('ISSUE_CREATED', { issue }, 201);
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

export const getProjectIssuesService = async (req: Request): Promise<ServiceResponse> => {
  
    const projectId = parseInt(req.params.projectId as string);

    const result = await db
    .select({
      id: jiraissue.id,
      issueNum: jiraissue.issueNum,
      pkey: jiraissue.pkey,
      summary: jiraissue.summary,
      description: jiraissue.description,
      duedate: jiraissue.duedate,
      created: jiraissue.created,
      updated: jiraissue.updated,
      projectId: jiraissue.projectId,
      reporterId: jiraissue.reporterId,
      assigneeId: jiraissue.assigneeId,
      creatorId: jiraissue.creatorId,
      issuetypeId: jiraissue.issuetypeId,
      issuestatusId: jiraissue.issuestatusId,
      priorityId: jiraissue.priorityId,
      type: issuetype.pname,
      status: sql`upper(${issuestatus.pname})`,
      priority: priority.pname
    })
    .from(jiraissue)
    .where(eq(jiraissue.projectId, projectId))
    .orderBy(desc(jiraissue.id))
    .leftJoin(issuetype, eq(jiraissue.issuetypeId, issuetype.id))
    .leftJoin(issuestatus, eq(jiraissue.issuestatusId, issuestatus.id))
    .leftJoin(priority, eq(jiraissue.priorityId, priority.id));

    const data = result.map(r => toCamelCase(r));
    return serviceResponse.success('DATA_FETCHED', data);
 
};


export const getIssueByIdService = async (req: Request): Promise<ServiceResponse> => {
    const id = parseInt(req.params.id as string);
    const assignee = alias(userSchema, 'assignee');
    const reporter = alias(userSchema, 'reporter');

    const result = await db
    .select({
      id: jiraissue.id,
      issueNum: jiraissue.issueNum,
      pkey: jiraissue.pkey,
      summary: jiraissue.summary,
      description: jiraissue.description,
      duedate: jiraissue.duedate,
      created: jiraissue.created,
      updated: jiraissue.updated,
      projectId: jiraissue.projectId,
      reporterId: jiraissue.reporterId,
      assigneeId: jiraissue.assigneeId,
      creatorId: jiraissue.creatorId,
      issuetypeId: jiraissue.issuetypeId,
      issuestatusId: jiraissue.issuestatusId,
      priorityId: jiraissue.priorityId,
      type: issuetype.pname,
      status: sql`upper(${issuestatus.pname})`,
      priority: priority.pname,
      project_name: projectTbl.pname,
      project_key: projectTbl.pkey,
      assignee_username: assignee.username,
      assignee_display_name: assignee.displayName,
      reporter_username: reporter.username,
      reporter_display_name: reporter.displayName
    })
    .from(jiraissue)
    .orderBy(desc(jiraissue.id))
    .leftJoin(issuetype, eq(jiraissue.issuetypeId, issuetype.id))
    .leftJoin(issuestatus, eq(jiraissue.issuestatusId, issuestatus.id))
    .leftJoin(priority, eq(jiraissue.priorityId, priority.id))
    .leftJoin(projectTbl, eq(jiraissue.projectId, projectTbl.id))
    .leftJoin(assignee, eq(jiraissue.assigneeId, assignee.id))
    .leftJoin(reporter, eq(jiraissue.reporterId, reporter.id))
    .where(eq(jiraissue.id, id)).limit(1);

    if (result.length === 0) {
      return serviceResponse.error('INTERNAL_SERVER_ERROR', { message: 'Issue not found' }, 404);
    }

    return serviceResponse.success('DATA_FETCHED', toCamelCase(result[0]));
  
};

export const getCommentsService = async (req: Request): Promise<ServiceResponse> => {
    const issueId = parseInt(req.params.id as string);

    const result = await db
      .select({
        id: jiraaction.id,
        issueId: jiraaction.issueId,
        authorId: jiraaction.authorId,
        actionbody: jiraaction.actionbody,
        created: jiraaction.created,
        updated: jiraaction.updated,
        authorUsername: userSchema.username,
        authorDisplayName: userSchema.displayName
      })
      .from(jiraaction)
      .leftJoin(userSchema, eq(jiraaction.authorId, userSchema.id))
      .where(eq(jiraaction.issueId, issueId))
      .orderBy(asc(jiraaction.created));

    return serviceResponse.success('DATA_FETCHED', result.map(r => toCamelCase(r)));
};

export const addCommentService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const issueId = parseInt(req.params.id as string);
    const { body: commentBody } = req.body as { body: string };

    const [inserted] = await db.insert(jiraaction).values({
      issueId,
      authorId: req.authUser?.id ?? null,
      actionbody: commentBody,
    }).returning({ id: jiraaction.id });

    const enriched = await db
      .select({
        id: jiraaction.id,
        issueId: jiraaction.issueId,
        authorId: jiraaction.authorId,
        actionbody: jiraaction.actionbody,
        created: jiraaction.created,
        updated: jiraaction.updated,
        authorUsername: userSchema.username,
        authorDisplayName: userSchema.displayName
      })
      .from(jiraaction)
      .leftJoin(userSchema, eq(jiraaction.authorId, userSchema.id))
      .where(eq(jiraaction.id, inserted.id));

    return serviceResponse.success('COMMENT_ADDED', toCamelCase(enriched[0]), 201);
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

export const getSubtasksService = async (req: Request): Promise<ServiceResponse> => {
  const parentId = parseInt(req.params.id as string);
  const assignee = alias(userSchema, 'assignee');

  const result = await db
    .select({
      id: jiraissue.id,
      pkey: jiraissue.pkey,
      summary: jiraissue.summary,
      status: sql`upper(${issuestatus.pname})`,
      type: issuetype.pname,
      priority: priority.pname,
      assignee_username: assignee.username,
      assignee_display_name: assignee.displayName,
    })
    .from(jiraissue)
    .leftJoin(issuetype,   eq(jiraissue.issuetypeId,   issuetype.id))
    .leftJoin(issuestatus, eq(jiraissue.issuestatusId, issuestatus.id))
    .leftJoin(priority,    eq(jiraissue.priorityId,    priority.id))
    .leftJoin(assignee,    eq(jiraissue.assigneeId,    assignee.id))
    .where(eq(jiraissue.parentId, parentId))
    .orderBy(asc(jiraissue.id));

  return serviceResponse.success('DATA_FETCHED', result.map(r => toCamelCase(r)));
};

export const createSubtaskService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const parentId = parseInt(req.params.id as string);
    const { summary, description, issuetypeId, priorityId, assigneeId } = req.body;

    const [parent] = await db
      .select({ projectId: jiraissue.projectId })
      .from(jiraissue)
      .where(eq(jiraissue.id, parentId))
      .limit(1);
    if (!parent) return serviceResponse.error('PARENT_NOT_FOUND', {}, 404);

    const [projectRow] = await db
      .select()
      .from(projectTbl)
      .where(eq(projectTbl.id, Number(parent.projectId)))
      .limit(1);
    if (!projectRow) return serviceResponse.error('PROJECT_NOT_FOUND', {}, 404);

    const [todoStatus] = await db
      .select()
      .from(issuestatus)
      .where(eq(issuestatus.pname, 'To Do'))
      .limit(1);
    if (!todoStatus) return serviceResponse.error('STATUS_NOT_CONFIGURED', {}, 500);

    const [countResult] = await db
      .select({ cnt: sql<number>`count(*)` })
      .from(jiraissue)
      .where(eq(jiraissue.projectId, Number(parent.projectId)));
    const issueNum = Number(countResult?.cnt ?? 0) + 1;
    const pkey = `${projectRow.pkey}-${issueNum}`;

    const [issue] = await db
      .insert(jiraissue)
      .values({
        issueNum,
        pkey,
        projectId:     Number(parent.projectId),
        parentId,
        summary,
        description:   description ?? null,
        issuetypeId:   issuetypeId  ? Number(issuetypeId)  : null,
        issuestatusId: todoStatus.id!,
        priorityId:    priorityId   ? Number(priorityId)   : null,
        assigneeId:    assigneeId   ? Number(assigneeId)   : null,
        reporterId:    req.authUser?.id ?? null,
        creatorId:     req.authUser?.id ?? null,
      })
      .returning({ id: jiraissue.id, pkey: jiraissue.pkey });

    return serviceResponse.success('SUBTASK_CREATED', { issue }, 201);
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

export const linkSubtaskService = async (req: AuthRequest): Promise<ServiceResponse> => {
  try {
    const childId  = parseInt(req.params.childId as string);
    const parentId = parseInt(req.body.parentId as string);

    if (childId === parentId)
      return serviceResponse.error('VALIDATION_ERROR', { message: 'An issue cannot be its own parent' }, 400);

    const [updated] = await db
      .update(jiraissue)
      .set({ parentId })
      .where(eq(jiraissue.id, childId))
      .returning({ id: jiraissue.id });

    if (!updated) return serviceResponse.error('ISSUE_NOT_FOUND', {}, 404);

    return serviceResponse.success('SUBTASK_LINKED', { id: childId });
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

export const updateIssueStatusService = async (req: AuthRequest): Promise<ServiceResponse> => {

    const id = parseInt(req.params.id as string);
    const { status } = req.body as { status?: string };

    if (!status) return serviceResponse.error('VALIDATION_ERROR', { status: 'status is required' }, 400);
    const [statusRow] = await db.select().from(issuestatus).where(ilike(issuestatus.pname, status)).limit(1);
    const result = await db
      .update(jiraissue)
      .set({ issuestatusId: statusRow.id })
      .where(eq(jiraissue.id, id))
      .returning();

    if (result.length === 0) {
      return serviceResponse.error('INTERNAL_SERVER_ERROR', { message: 'Issue not found or status invalid' }, 404);
    }

    return serviceResponse.success('DEFAULT', { id });
}

// Removed incorrect UPPER helper function; use sql`upper(${column})` for column expressions
// and ilike(column, value) for case-insensitive comparisons against runtime strings.

