import { Request } from "express";
import { db } from "../../config/db";
import { user } from "../../db/schema/user";
import { eq, or, ilike, asc, sql } from "drizzle-orm";
import { serviceResponse, ServiceResponse } from "../../utils/serviceResponse";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-prod";
//const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'];

type UserServiceResponse = ServiceResponse;

export const getUsersService = async (
  req: Request,
): Promise<UserServiceResponse> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = String(req.query.search || "");
  const skip = (page - 1) * limit;

  const whereCondition = search
    ? or(
        ilike(user.displayName, `%${search}%`),
        ilike(user.email, `%${search}%`),
        ilike(user.username, `%${search}%`),
      )
    : undefined;

  const result = await db.transaction(async (tx) => {
    const usersData = await tx
      .select()
      .from(user)
      .where(whereCondition)
      .limit(limit)
      .offset(skip)
      .orderBy(asc(user.id));

    const totalResult = await tx
      .select({
        count: sql<number>` count(*) `,
      })
      .from(user)
      .where(whereCondition);

    const total = Number(totalResult[0].count);

    return {
      users: usersData,
      total,
    };
  });
  const data = {
    users: result.users,
    total: result.total,
    page,
    limit,
    totalPages: Math.ceil(result.total / limit),
  };
  return { ...serviceResponse.success("USERS_FETCHED_SUCCESSFULLY", data) };
};

export const updateUserService = async (req: Request): Promise<UserServiceResponse>  => {
 
    const { userId } = req.params;
    const { displayName, email, active, role } = req.body;
    const VALID_ROLES = ['admin', 'member', 'viewer'];

    const updatedUser = await db
      .update(user)
      .set({
        displayName,
        email,
        active,
        ...(VALID_ROLES.includes(role) ? { role } : {}),
      })
      .where(eq(user.id, Number(userId)))
      .returning();

    return { ...serviceResponse.success("USER_UPDATED_SUCCESSFULLY", updatedUser[0]) };
 
};

export const deleteUserService = async (req: Request): Promise<UserServiceResponse> => {

    const { userId } = req.params;
    await db.delete(user).where(eq(user.id, Number(userId)));
    return { ...serviceResponse.success("USER_DELETED_SUCCESSFULLY", null) };
};
