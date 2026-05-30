"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler = (err, req, res, next) => {
    logger_1.default.error(`Unhandled Error: ${err.message}`, err);
    res.status(err.status || 500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
};
exports.default = errorHandler;
