"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const candidate_routes_1 = __importDefault(require("./routes/candidate.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const notFound_middleware_1 = require("./middlewares/notFound.middleware");
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const context_middleware_1 = require("./middlewares/context.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(context_middleware_1.contextMiddleware);
app.use("/api/candidate", candidate_routes_1.default);
//app.use("/api/proctor", proctor);
app.use("/api/admin", admin_routes_1.default);
app.use(notFound_middleware_1.notFound);
app.use(error_middleware_1.default);
exports.default = app;
