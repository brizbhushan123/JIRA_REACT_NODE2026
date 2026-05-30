import { Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from "../../config/db";
import { serviceResponse, ServiceResponse } from '../../utils/serviceResponse';
import { adminLogin } from '../../db/schema/adminLogin';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'];

type AdminAuthServiceResponse = ServiceResponse & { token?: string };

export const adminLoginService = async (req: Request): Promise<AdminAuthServiceResponse> => {
  try {
    const { email, password } = req.body;
    const [admin] = await db
      .select()
      .from(adminLogin)
      .where(eq(adminLogin.email, email));
      
    if (!admin || !admin.passwordHash || admin.active === false) {
      return serviceResponse.error('INVALID_CREDENTIALS', {}, 401);
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return serviceResponse.error('INVALID_CREDENTIALS', {}, 401);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    const { passwordHash: _ph, ...safeAdmin } = admin as unknown as Record<string, unknown>;

    return { ...serviceResponse.success('LOGIN_SUCCESS', { admin: safeAdmin }), token };
  } catch (error) {
    return serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
  }
};
