import { Request, Response, NextFunction } from "express";
import { ApiResponse } from '../../utils/apiResponse';
import {
  getUsersService,
  updateUserService,
  deleteUserService,
} from "../../services/admin/user.service";

/* =========================
   GET USERS
========================= */

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getUsersService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error: any) {
    next(error);
  }
};

/* =========================
   UPDATE USER
========================= */

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await updateUserService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error: any) {
    next(error);
  }
};

/* =========================
   DELETE USER
========================= */

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteUserService(req);
    if (!result.status) {
      res.status(result.httpCode).json(ApiResponse.error(result.key, result.data));
      return;
    }
    res.status(result.httpCode).json(ApiResponse.success(result.key, result.data));
  } catch (error: any) {
    next(error);
  }
};
