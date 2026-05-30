"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utility = void 0;
class Utility {
    /* Logs messages to the console only in the development environment */
    /**
     *
     * @param {...any} args
     */
    log(...args) {
        if (process.env.NODE_ENV == 'development') {
            console.log('[' + process.env.NODE_ENV + ']', ...args);
        }
    }
    error(...args) {
        if (process.env.NODE_ENV == 'development') {
            console.error('[' + process.env.NODE_ENV + ']', ...args);
        }
    }
    warn(...args) {
        if (process.env.NODE_ENV == 'development') {
            console.warn('[' + process.env.NODE_ENV + ']', ...args);
        }
    }
}
exports.utility = new Utility();
