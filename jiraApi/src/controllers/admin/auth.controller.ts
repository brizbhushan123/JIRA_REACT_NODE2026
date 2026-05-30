import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../../utils/validation';
import { ApiResponse } from '../../utils/apiResponse';
import logger from '../../config/logger';
import { adminLoginService } from '../../services/admin/auth.service';
import { getAccessTokenCookieConfig } from '../../utils/tokenUtils';

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const result = await adminLoginService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }

    if (result.token) {
      const cookieConfig = getAccessTokenCookieConfig(result.token, 'admin');
      
      // Ensure domain is a plain hostname (no protocol, no port) to avoid TypeError in cookie package
      const options = { ...cookieConfig.options };
      if (options.domain) {
        options.domain = options.domain.replace(/^(https?:\/\/)/, '').split(':')[0];
      }

      res.cookie(cookieConfig.name, cookieConfig.value, options);
    }

    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error) {
    next(error);
  }
};

export const adminLogout = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const cookieConfig = getAccessTokenCookieConfig('', 'admin');
    
    // Apply same domain sanitization for clearing the cookie
    const options = { ...cookieConfig.options };
    if (options.domain) {
      options.domain = options.domain.replace(/^(https?:\/\/)/, '').split(':')[0];
    }

    res.clearCookie(cookieConfig.name, options);
    res.json(ApiResponse.success('LOGOUT_SUCCESS'));
  } catch (error) {
    next(error);
  }
  
};
