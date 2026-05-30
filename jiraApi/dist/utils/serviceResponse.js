"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceResponse = void 0;
exports.serviceResponse = {
    success(key = "DEFAULT", data = {}, httpCode = 200) {
        return {
            status: true,
            httpCode,
            key,
            data,
        };
    },
    error(key = "DEFAULT", data = {}, httpCode = 400) {
        return {
            status: false,
            httpCode,
            key,
            data,
        };
    },
};
