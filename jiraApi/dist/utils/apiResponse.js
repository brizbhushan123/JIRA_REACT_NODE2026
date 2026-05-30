"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = exports.ApiResponse = void 0;
const en_1 = require("../lang/en");
const hi_1 = require("../lang/hi");
const apiMessage_1 = require("./apiMessage");
const utility_1 = require("./utility");
const translations = { en: en_1.en, hi: hi_1.hi };
class ApiResponse {
    static getLocalizedMessage(messageKey) {
        const lang = Context.get("lang", "en");
        return (translations[lang]?.[messageKey] ||
            translations["en"]?.[messageKey] ||
            messageKey);
    }
    static message(type = "SUCCESS", key = "DEFAULT", payload = {}) {
        const messageData = apiMessage_1.apiMessages[type]?.[key] || apiMessage_1.apiMessages[type]["DEFAULT"];
        const localizedMessage = this.getLocalizedMessage(messageData.message_key);
        const returnObj = {
            status: true,
            code: messageData.code,
            message: localizedMessage,
            data: payload,
        };
        if (type === "ERROR") {
            returnObj.status = false;
        }
        utility_1.utility.log("API Response:", returnObj);
        return returnObj;
    }
    static success(key = "DEFAULT", data = {}) {
        return this.message("SUCCESS", key, data);
    }
    static error(key = "DEFAULT", errors = {}) {
        return this.message("ERROR", key, errors);
    }
}
exports.ApiResponse = ApiResponse;
class Context {
    static add(key, value) {
        this.store[key] = value;
    }
    static get(key, defaultValue) {
        return this.store[key] ?? defaultValue;
    }
    static clear() {
        this.store = {};
    }
}
exports.Context = Context;
Context.store = {};
