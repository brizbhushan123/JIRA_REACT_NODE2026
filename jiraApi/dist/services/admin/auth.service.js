"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminLogin_model_1 = __importDefault(require("../../models/adminLogin.model"));
const serviceResponse_1 = require("../../utils/serviceResponse");
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '30d');
const adminLoginService = async (req) => {
    try {
        const { email, password } = req.body;
        const admin = await adminLogin_model_1.default.findByEmail(email);
        if (!admin || !admin.passwordHash || admin.active === false) {
            return serviceResponse_1.serviceResponse.error('INVALID_CREDENTIALS', {}, 401);
        }
        const valid = await bcryptjs_1.default.compare(password, admin.passwordHash);
        if (!valid)
            return serviceResponse_1.serviceResponse.error('INVALID_CREDENTIALS', {}, 401);
        const token = jsonwebtoken_1.default.sign({ id: admin.id, email: admin.email, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const { passwordHash: _ph, ...safeAdmin } = admin;
        return { ...serviceResponse_1.serviceResponse.success('LOGIN_SUCCESS', { admin: safeAdmin }), token };
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.adminLoginService = adminLoginService;
