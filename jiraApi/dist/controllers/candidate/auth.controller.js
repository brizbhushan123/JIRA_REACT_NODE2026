"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const express_validator_1 = require("express-validator");
const validation_1 = require("../../utils/validation");
const apiResponse_1 = require("../../utils/apiResponse");
const logger_1 = __importDefault(require("../../config/logger"));
const auth_service_1 = require("../../services/candidate/auth.service");
const COOKIE_NAME = 'jira_token';
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
};
const register = async (req, res) => {
    try {
        const validators = [
            (0, express_validator_1.body)('username').notEmpty().withMessage('username is required'),
            (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
            (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        ];
        const validation = await (0, validation_1.validateRequest)(validators, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, auth_service_1.registerService)(req);
        if (!result.status) {
            logger_1.default.error(`${result.key}: ${JSON.stringify(result.data)}`);
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        res.status(result.httpCode).json(apiResponse_1.ApiResponse.success(result.key, result.data));
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error('INTERNAL_SERVER_ERROR', error));
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validators = [
            (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
            (0, express_validator_1.body)('password').notEmpty().withMessage('password is required'),
        ];
        const validation = await (0, validation_1.validateRequest)(validators, req);
        if (!validation.status) {
            res.status(validation.httpCode).json(apiResponse_1.ApiResponse.error(validation.key, validation.data));
            return;
        }
        const result = await (0, auth_service_1.loginService)(req);
        if (!result.status) {
            logger_1.default.error(`${result.key}: ${JSON.stringify(result.data)}`);
            res.status(result.httpCode).json(apiResponse_1.ApiResponse.error(result.key, result.data));
            return;
        }
        if (result.token) {
            res.cookie(COOKIE_NAME, result.token, cookieOptions);
        }
        res.status(result.httpCode).json(apiResponse_1.ApiResponse.success(result.key, result.data));
    }
    catch (error) {
        res.status(500).json(apiResponse_1.ApiResponse.error('INTERNAL_SERVER_ERROR', error));
    }
};
exports.login = login;
const logout = (_req, res) => {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax' });
    res.json(apiResponse_1.ApiResponse.success('LOGOUT_SUCCESS'));
};
exports.logout = logout;
