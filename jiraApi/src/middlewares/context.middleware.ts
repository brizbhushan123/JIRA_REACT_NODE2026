import { Request, Response, NextFunction } from "express";
import { context } from "../utils/context";

export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  context.run({}, () => { next(); });
};