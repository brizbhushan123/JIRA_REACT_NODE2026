"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginService = exports.registerService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appUser_model_1 = __importDefault(require("../../models/appUser.model"));
const serviceResponse_1 = require("../../utils/serviceResponse");
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '30d');
const registerService = async (req) => {
    try {
        const { username, email, password, displayName } = req.body;
        const existing = await appUser_model_1.default.findByEmail(email);
        if (existing)
            return serviceResponse_1.serviceResponse.error('EMAIL_EXISTS', {}, 409);
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const userKey = `user-${Date.now()}`;
        const user = await appUser_model_1.default.create({ userKey, username, email, displayName: displayName ?? null, passwordHash });
        const { passwordHash: _ph, ...safeUser } = user;
        return serviceResponse_1.serviceResponse.success('REGISTER_SUCCESS', { user: safeUser }, 201);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.registerService = registerService;
const loginService = async (req) => {
    try {
        const { email, password } = req.body;
        const user = await appUser_model_1.default.findByEmail(email);
        if (!user || !user.passwordHash)
            return serviceResponse_1.serviceResponse.error('INVALID_CREDENTIALS', {}, 401);
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid)
            return serviceResponse_1.serviceResponse.error('INVALID_CREDENTIALS', {}, 401);
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const { passwordHash: _ph, ...safeUser } = user;
        return { ...serviceResponse_1.serviceResponse.success('LOGIN_SUCCESS', { user: safeUser }), token };
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.loginService = loginService;
