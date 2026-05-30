import { Request, Response, NextFunction } from "express";
import { context } from "../utils/context";
import { ApiResponse } from "../utils/apiResponse";
import * as tokenUtility from "../utils/tokenUtils";
import jwt from "jsonwebtoken";

export interface TokenPayloadData {
  sessionId?: number | string | null;
  instanceId?: number | string | null;
  clientId?: number | string | null;
  templateId?: number | string | null;
  candidateId?: number | string | null;
  language?: string | null
  [key: string]: any;
}

export interface DecodedToken {
  role: string;
  data?: TokenPayloadData;
  iat: number;
  exp: number;
}

export function candidateAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  const role = tokenUtility.ROLE_CANDIDATE;

  const token = getToken(req, role);

  if (!token) {
    return res.status(401).json(ApiResponse.error("TOKEN_MISSING"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret",
    ) as DecodedToken;

    setContext(decoded);

    return next();
  } catch (error: any) {
    return res.status(401).json(
      ApiResponse.error("TOKEN_INVALID", error?.message ?? "Invalid token"),
    );
  }
}

function getToken(req: Request, role: string): string | null {
  const authHeader = req.headers.authorization;

  const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  const cookieToken = req.cookies?.[`access_token_${role}_${process.env.NODE_ENV}`] ?? null;

  return bearerToken || cookieToken;
}

function setContext(decoded: TokenPayloadData): void {
  const data = decoded.data ?? {};
  context.set("role", decoded.role ?? null);

  context.set("sessionId", data.sessionId ?? null);
  context.set("instanceId", data.instanceId ?? null);
  context.set("clientId", data.clientId ?? null);
  context.set("templateId", data.templateId ?? null);
  context.set("candidateId", data.candidateId ?? null);
  context.set("language", data.language ?? null);
}
