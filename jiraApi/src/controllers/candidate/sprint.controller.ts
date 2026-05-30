import { Response } from 'express';
import { ApiResponse } from '../../utils/apiResponse';
import { AuthRequest } from '../../middlewares/requireAuth';
import {
  getSprintsService,
  createSprintService,
  updateSprintService,
  startSprintService,
  completeSprintService,
  deleteSprintService,
  addIssuesToSprintService,
  removeIssueFromSprintService,
} from '../../services/candidate/sprint.service';

export const getSprints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await getSprintsService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const createSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await createSprintService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const updateSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await updateSprintService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const startSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await startSprintService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const completeSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await completeSprintService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const deleteSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await deleteSprintService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const addIssuesToSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await addIssuesToSprintService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const removeIssueFromSprint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await removeIssueFromSprintService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};
