"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.candidateAuthMiddleware = candidateAuthMiddleware;
const context_1 = require("../utils/context");
const apiResponse_1 = require("../utils/apiResponse");
const tokenUtility = __importStar(require("../utils/tokenUtils"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function candidateAuthMiddleware(req, res, next) {
    const role = tokenUtility.ROLE_CANDIDATE;
    const token = getToken(req, role);
    if (!token) {
        return res.status(401).json(apiResponse_1.ApiResponse.error("TOKEN_MISSING"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret");
        setContext(decoded);
        return next();
    }
    catch (error) {
        return res.status(401).json(apiResponse_1.ApiResponse.error("TOKEN_INVALID", error?.message ?? "Invalid token"));
    }
}
function getToken(req, role) {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const cookieToken = req.cookies?.[`access_token_${role}_${process.env.NODE_ENV}`] ?? null;
    return bearerToken || cookieToken;
}
function setContext(decoded) {
    const data = decoded.data ?? {};
    context_1.context.set("role", decoded.role ?? null);
    context_1.context.set("sessionId", data.sessionId ?? null);
    context_1.context.set("instanceId", data.instanceId ?? null);
    context_1.context.set("clientId", data.clientId ?? null);
    context_1.context.set("templateId", data.templateId ?? null);
    context_1.context.set("candidateId", data.candidateId ?? null);
    context_1.context.set("language", data.language ?? null);
}
