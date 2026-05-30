import { Request, Response } from "express";
import { ApiResponse, Context } from "../../utils/apiResponse";
import {client } from "../../db/schema/client";
import { serviceResponse, ServiceResponse } from "../../utils/serviceResponse";
import { db } from "../../config/db";


export const createClientService = async (
  req: Request,
): Promise<ServiceResponse> => {

    const clientObj = await db.insert(client).values( req.body);
    if(!clientObj){
        return serviceResponse.error("CLIENT_NOT_FOUND", {}, 400);
    }
    return serviceResponse.success("CLIENT_CREATED", clientObj);

};

