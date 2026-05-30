import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../../utils/validation';
import { ApiResponse } from '../../utils/apiResponse';
import logger from '../../config/logger';
import { AuthRequest } from '../../middlewares/requireAuth';
import {
  createIssueService,
  getIssueByIdService,
  getProjectIssuesService,
  updateIssueStatusService,
  getCommentsService,
  addCommentService,
  getSubtasksService,
  createSubtaskService,
  linkSubtaskService,
} from '../../services/candidate/issue.service';

export const createIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validators = [
      body('projectId').notEmpty().isInt({ min: 1 }).withMessage('Valid projectId is required'),
      body('summary').notEmpty().withMessage('summary is required'),
      body('issuetypeId').notEmpty().isInt({ min: 1 }).withMessage('Valid issuetypeId is required'),
      body('priorityId').optional().isInt({ min: 1 }).withMessage('priorityId must be a valid integer'),
      body('assigneeId').optional().isInt({ min: 1 }).withMessage('assigneeId must be a valid integer'),
      body('duedate').optional().isISO8601().withMessage('duedate must be a valid date'),
    ];

    const validation = await validateRequest(validators, req as Request);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await createIssueService(req);
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

export const getProjectIssues = async (req: Request, res: Response): Promise<void> => {
  try {
    const validators = [
      param('projectId').isInt({ min: 1 }).withMessage('Valid projectId is required'),
    ];

    const validation = await validateRequest(validators, req);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await getProjectIssuesService(req);
    if (!result.status) {
      logger.error(`${result.key}: ${JSON.stringify(result.data)}`);
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }

    res.json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const getIssueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const validators = [
      param('id').isInt({ min: 1 }).withMessage('Valid issue id is required'),
    ];

    const validation = await validateRequest(validators, req);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await getIssueByIdService(req);
    if (!result.status) {
      logger.error(`${result.key}: ${JSON.stringify(result.data)}`);
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }

    res.json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const validators = [
      param('id').isInt({ min: 1 }).withMessage('Valid issue id is required'),
    ];

    const validation = await validateRequest(validators, req);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await getCommentsService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }

    res.json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validators = [
      param('id').isInt({ min: 1 }).withMessage('Valid issue id is required'),
      body('body').notEmpty().withMessage('Comment body is required'),
    ];

    const validation = await validateRequest(validators, req as Request);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await addCommentService(req);
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

export const getSubtasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const validators = [param('id').isInt({ min: 1 }).withMessage('Valid issue id is required')];
    const validation = await validateRequest(validators, req);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }
    const result = await getSubtasksService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const createSubtask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validators = [
      param('id').isInt({ min: 1 }).withMessage('Valid parent issue id is required'),
      body('summary').notEmpty().withMessage('summary is required'),
    ];
    const validation = await validateRequest(validators, req as Request);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }
    const result = await createSubtaskService(req);
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

export const linkSubtask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validators = [
      param('childId').isInt({ min: 1 }).withMessage('Valid child issue id is required'),
      body('parentId').isInt({ min: 1 }).withMessage('Valid parentId is required'),
    ];
    const validation = await validateRequest(validators, req as Request);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }
    const result = await linkSubtaskService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const updateIssueStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validators = [
      param('id').isInt({ min: 1 }).withMessage('Valid issue id is required'),
      body('status').notEmpty().withMessage('status is required'),
    ];

    const validation = await validateRequest(validators, req as Request);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await updateIssueStatusService(req);
    if (!result.status) {
      logger.error(`${result.key}: ${JSON.stringify(result.data)}`);
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }

    res.json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};
