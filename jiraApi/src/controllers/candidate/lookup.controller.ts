import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/apiResponse';
import logger from '../../config/logger';
import {
  getIssueTypesService,
  getIssueStatusesService,
  getPrioritiesService,
  getUsersService,
  getProjectsService,
} from '../../services/candidate/lookup.service';

const respond = async (
  res: Response,
  fn: () => Promise<import('../../utils/serviceResponse').ServiceResponse>,
): Promise<void> => {
  try {
    const result = await fn();
    if (!result.status) {
      logger.error(`${result.key}: ${JSON.stringify(result.data)}`);
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const getIssueTypes    = (_req: Request, res: Response) => respond(res, getIssueTypesService);
export const getIssueStatuses = (_req: Request, res: Response) => respond(res, getIssueStatusesService);
export const getPriorities    = (_req: Request, res: Response) => respond(res, getPrioritiesService);
export const getUsers         = (_req: Request, res: Response) => respond(res, getUsersService);
export const getProjects      = (_req: Request, res: Response) => respond(res, getProjectsService);
