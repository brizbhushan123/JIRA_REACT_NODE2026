"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const notFound = (req, res, next) => {
    logger_1.default.error(`Route not found: ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
};
exports.notFound = notFound;
