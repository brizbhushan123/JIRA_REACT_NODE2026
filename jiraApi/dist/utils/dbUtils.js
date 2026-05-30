"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCamelCase = toCamelCase;
exports.toSnakeCase = toSnakeCase;
function toCamelCase(row) {
    const result = {};
    for (const key of Object.keys(row)) {
        const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
        result[camelKey] = row[key];
    }
    return result;
}
function toSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}
