"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = void 0;
const validation_1 = require("../../utils/validation");
const express_validator_1 = require("express-validator");
const client_service_1 = require("../../services/admin/client.service");
const apiResponse_1 = require("../../utils/apiResponse");
const logger_1 = __importDefault(require("../../config/logger"));
const createClient = async (req, res) => {
    try {
        const createSessionValidator = [
            (0, express_validator_1.body)("apiKey").notEmpty().withMessage("api_key is required"),
            (0, express_validator_1.body)("secretKey").notEmpty().withMessage("secret_key is required"),
        ];
        const validation = await (0, validation_1.validateRequest)(createSessionValidator, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, client_service_1.createClientService)(req);
        if (!result.status) {
            logger_1.default.error(`${result.key}' : '${result.data}`);
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        res.status(result.httpCode).json(apiResponse_1.ApiResponse.success(result.key, result.data));
        return;
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error("INTERNAL_SERVER_ERROR", error));
        return;
    }
};
exports.createClient = createClient;
