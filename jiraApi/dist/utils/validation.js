"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const serviceResponse_1 = require("./serviceResponse");
const logger_1 = __importDefault(require("../config/logger"));
const validateRequest = async (schema, req) => {
    await Promise.all(schema.map((validation) => validation.run(req)));
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = {};
        errors.array().forEach((err) => {
            const field = "path" in err ? err.path : "unknown";
            if (!formattedErrors[field]) {
                formattedErrors[field] = err.msg;
            }
        });
        logger_1.default.error(`VALIDATION_ERROR: ${JSON.stringify(formattedErrors)}`);
        return serviceResponse_1.serviceResponse.error('VALIDATION_ERROR', formattedErrors, 402);
    }
    else {
        return serviceResponse_1.serviceResponse.success();
    }
};
exports.validateRequest = validateRequest;
