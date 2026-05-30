import { Request } from 'express';
import { db } from '../../config/db';
import { project } from '../../db/schema';
import { eq, ilike, or, sql } from 'drizzle-orm';
import { serviceResponse, ServiceResponse } from '../../utils/serviceResponse';

export const getProjectsAdminService = async (req: Request): Promise<ServiceResponse> => {
  const search = String(req.query.search || '');

  const where = search
    ? or(ilike(project.pname, `%${search}%`), ilike(project.pkey, `%${search}%`))
    : undefined;

  const [data, countResult] = await Promise.all([
    db.select().from(project).where(where).orderBy(project.id),
    db.select({ count: sql<number>`count(*)` }).from(project).where(where),
  ]);

  return serviceResponse.success('DATA_FETCHED', {
    projects: data,
    total: Number(countResult[0].count),
  });
};

export const createProjectService = async (req: Request): Promise<ServiceResponse> => {
  try {
    const { pname, pkey, description, lead } = req.body as {
      pname: string;
      pkey: string;
      description?: string;
      lead?: string;
    };

    if (!pname?.trim()) return serviceResponse.error('VALIDATION_ERROR', { pname: 'Project name is required' }, 400);
    if (!pkey?.trim())  return serviceResponse.error('VALIDATION_ERROR', { pkey: 'Project key is required' }, 400);

    const normalizedKey = pkey.trim().toUpperCase();

    const [existing] = await db.select({ id: project.id }).from(project).where(eq(project.pkey, normalizedKey)).limit(1);
    if (existing) return serviceResponse.error('DUPLICATE_KEY', { pkey: 'Project key already exists' }, 409);

    const [created] = await db.insert(project).values({
      pname: pname.trim(),
      pkey: normalizedKey,
      description: description?.trim() || null,
      lead: lead?.trim() || null,
    }).returning();

    return serviceResponse.success('PROJECT_CREATED', created, 201);
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

export const updateProjectService = async (req: Request): Promise<ServiceResponse> => {
  try {
    const id = parseInt(req.params.projectId as string, 10);
    const { pname, description, lead } = req.body as {
      pname?: string;
      description?: string;
      lead?: string;
    };

    const [existing] = await db.select().from(project).where(eq(project.id, id)).limit(1);
    if (!existing) return serviceResponse.error('NOT_FOUND', { message: 'Project not found' }, 404);

    const [updated] = await db.update(project).set({
      ...(pname        !== undefined ? { pname: pname.trim() }               : {}),
      ...(description  !== undefined ? { description: description.trim() || null } : {}),
      ...(lead         !== undefined ? { lead: lead.trim() || null }          : {}),
    }).where(eq(project.id, id)).returning();

    return serviceResponse.success('PROJECT_UPDATED', updated);
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

export const deleteProjectService = async (req: Request): Promise<ServiceResponse> => {
  try {
    const id = parseInt(req.params.projectId as string, 10);

    const [existing] = await db.select({ id: project.id }).from(project).where(eq(project.id, id)).limit(1);
    if (!existing) return serviceResponse.error('NOT_FOUND', { message: 'Project not found' }, 404);

    await db.delete(project).where(eq(project.id, id));
    return serviceResponse.success('PROJECT_DELETED', { id });
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};
