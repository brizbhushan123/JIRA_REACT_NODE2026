import { Request, Response, NextFunction } from "express";
import { validateRequest } from "../../utils/validation";
import { body, validationResult } from "express-validator";
import { createClientService } from "../../services/admin/client.service";
import { ApiResponse, Context } from "../../utils/apiResponse";
import logger from "../../config/logger";


export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createSessionValidator = [
      body("apiKey").notEmpty().withMessage("api_key is required"),
      body("secretKey").notEmpty().withMessage("secret_key is required"),
    ];

    const validation = await validateRequest(createSessionValidator, req);

    if (!validation.status) {
      res.status(validation.httpCode).json(ApiResponse.error(validation.key, validation.data));
      return;
    }

    const result = await createClientService(req);
    if (!result.status) {
        logger.error(`${result.key}' : '${result.data}`);
        res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
        return;
    }

    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
    return;
  } catch (error) {
    next(error);
  } 
};
