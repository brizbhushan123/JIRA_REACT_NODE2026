import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  logger.error(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};