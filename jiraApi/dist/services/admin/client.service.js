"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientService = void 0;
const client_model_1 = __importDefault(require("../../models/client.model"));
const serviceResponse_1 = require("../../utils/serviceResponse");
const createClientService = async (req) => {
    try {
        const clientObj = await client_model_1.default.create(req.body);
        if (!clientObj) {
            return serviceResponse_1.serviceResponse.error("CLIENT_NOT_FOUND", {}, 400);
        }
        return serviceResponse_1.serviceResponse.success("CLIENT_CREATED", clientObj);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error("INTERNAL_SERVER_ERROR", error, 500);
    }
};
exports.createClientService = createClientService;
