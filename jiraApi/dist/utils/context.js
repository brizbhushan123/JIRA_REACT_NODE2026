"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.context = void 0;
const async_hooks_1 = require("async_hooks");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
class RequestContext {
    run(data, callback) {
        asyncLocalStorage.run(data, callback);
    }
    getStore() {
        return asyncLocalStorage.getStore() || {};
    }
    set(key, value) {
        const store = asyncLocalStorage.getStore();
        if (store) {
            store[key] = value;
        }
    }
    get(key) {
        return asyncLocalStorage.getStore()?.[key];
    }
    getAll() {
        return asyncLocalStorage.getStore();
    }
    clear() {
        const store = asyncLocalStorage.getStore();
        if (store) {
            Object.keys(store).forEach((key) => {
                delete store[key];
            });
        }
    }
}
exports.context = new RequestContext();
