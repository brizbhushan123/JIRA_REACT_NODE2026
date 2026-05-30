"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextMiddleware = void 0;
const context_1 = require("../utils/context");
const contextMiddleware = (req, res, next) => {
    context_1.context.run({}, () => { next(); });
};
exports.contextMiddleware = contextMiddleware;
