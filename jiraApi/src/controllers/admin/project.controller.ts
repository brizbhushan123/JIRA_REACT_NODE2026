import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/apiResponse';
import {
  getProjectsAdminService,
  createProjectService,
  updateProjectService,
  deleteProjectService,
} from '../../services/admin/project.service';

const handle = async (res: Response, fn: () => Promise<any>) => {
  const result = await fn();
  if (!result.status) {
    res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
    return;
  }
  res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
};

export const getProjectsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try { await handle(res, () => getProjectsAdminService(req)); } catch (e) { next(e); }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try { await handle(res, () => createProjectService(req)); } catch (e) { next(e); }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try { await handle(res, () => updateProjectService(req)); } catch (e) { next(e); }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try { await handle(res, () => deleteProjectService(req)); } catch (e) { next(e); }
};
