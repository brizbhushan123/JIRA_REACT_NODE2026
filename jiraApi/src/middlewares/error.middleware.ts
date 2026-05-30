import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled Error: ${err.message}`, err);

  res.status(err.status || 500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
};

export default errorHandler;