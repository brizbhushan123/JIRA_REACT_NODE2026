"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiResponse_1 = require("../utils/apiResponse");
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const requireAuth = (req, res, next) => {
    const token = req.cookies?.jira_token;
    if (!token) {
        res.status(401).json(apiResponse_1.ApiResponse.error('NOT_AUTHENTICATED'));
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.authUser = payload;
        next();
    }
    catch {
        res.status(401).json(apiResponse_1.ApiResponse.error('SESSION_EXPIRED'));
    }
};
exports.requireAuth = requireAuth;
