import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  authUser?: { id: number; email: string; username: string };
}

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.jira_token;
  if (!token) {
    res.status(401).json(ApiResponse.error('NOT_AUTHENTICATED'));
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; email: string; username: string };
    req.authUser = payload;
    next();
  } catch {
    res.status(401).json(ApiResponse.error('SESSION_EXPIRED'));
  }
};
