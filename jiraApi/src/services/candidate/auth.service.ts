import { Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { user as userSchema } from '../../db/schema/user';
import { serviceResponse, ServiceResponse } from '../../utils/serviceResponse';
import { db } from '../../config/db';
import { eq, or, ilike, asc, sql } from "drizzle-orm";


const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'];

type AuthServiceResponse = ServiceResponse & { token?: string };

export const registerService = async (req: Request): Promise<ServiceResponse> => {
  try {
    const { username, email, password, displayName, avatarUrl, role, phone, employeeId, jobTitle, team } = req.body;

    const [existing] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .limit(1);
    if (existing) return serviceResponse.error('EMAIL_EXISTS', {}, 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const userKey = `user-${Date.now()}`;

    const VALID_ROLES = ['admin', 'member', 'viewer'];
    const assignedRole = VALID_ROLES.includes(role) ? role : 'member';

    const user = await db.insert(userSchema).values({
      userKey, username, email,
      displayName: displayName ?? null,
      passwordHash,
      avatarUrl: avatarUrl ?? null,
      role: assignedRole,
      phone: phone ?? null,
      employeeId: employeeId ?? null,
      jobTitle: jobTitle ?? null,
      team: team ?? null,
    });
    const { passwordHash: _ph, ...safeUser } = user as unknown as Record<string, unknown>;

    return serviceResponse.success('REGISTER_SUCCESS', { user: safeUser }, 201);
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};

export const loginService = async (req: Request): Promise<AuthServiceResponse> => {
  
    const { email, password } = req.body;

    const [user] = await db.select()
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);
    if (!user || !user.passwordHash) return serviceResponse.error('INVALID_CREDENTIALS', {}, 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return serviceResponse.error('INVALID_CREDENTIALS', {}, 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    const { passwordHash: _ph, ...safeUser } = user as unknown as Record<string, unknown>;

    return { ...serviceResponse.success('LOGIN_SUCCESS', { user: safeUser }), token };

};
