import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../../utils/validation';
import { ApiResponse } from '../../utils/apiResponse';
import logger from '../../config/logger';
import { registerService, loginService } from '../../services/candidate/auth.service';

const COOKIE_NAME = 'jira_token';
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validators = [
      body('username').notEmpty().withMessage('username is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ];

    const validation = await validateRequest(validators, req);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await registerService(req);
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

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validators = [
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').notEmpty().withMessage('password is required'),
    ];

    const validation = await validateRequest(validators, req);
    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await loginService(req);
    if (!result.status) {
      logger.error(`${result.key}: ${JSON.stringify(result.data)}`);
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }

    if (result.token) {
      res.cookie(COOKIE_NAME, result.token, cookieOptions);
    }

    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    res.status(500).json(ApiResponse.error('INTERNAL_SERVER_ERROR', error));
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax' });
  res.json(ApiResponse.success('LOGOUT_SUCCESS'));
};
