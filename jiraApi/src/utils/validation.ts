import { Request, Response } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { serviceResponse, ServiceResponse } from "./serviceResponse";
import logger from "../config/logger";



export const validateRequest = async (schema: ValidationChain[], req: Request): Promise<ServiceResponse> => {
    await Promise.all(schema.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors: Record<string, string> = {};

      errors.array().forEach((err) => {
        const field = "path" in err ? err.path : "unknown";

        if (!formattedErrors[field]) {
          formattedErrors[field] = err.msg;
        }
      });
      logger.error(`VALIDATION_ERROR: ${JSON.stringify(formattedErrors)}`);

      return serviceResponse.error('VALIDATION_ERROR', formattedErrors, 402);
     
    }else{
      return serviceResponse.success();
    }
};
      
