"use strict";
//  src/utils/commonUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.platform = exports.detectBrowser = void 0;
const detectBrowser = (userAgent) => {
    const browserRules = [
        { name: "Chrome", regex: /Chrome\/([0-9.]+)/i },
        { name: "Firefox", regex: /Firefox\/([0-9.]+)/i },
        { name: "Safari", regex: /Safari\/([0-9.]+)/i },
        { name: "Edge", regex: /Edge\/([0-9.]+)/i },
        { name: "IE", regex: /MSIE\s([0-9.]+)/i },
    ];
    for (const rule of browserRules) {
        const matches = userAgent.match(rule.regex);
        if (matches) {
            const browser = rule.name;
            const version = matches[1] || "";
            return browser + ' ' + version;
        }
    }
    return "Unknown";
};
exports.detectBrowser = detectBrowser;
const platform = () => {
    // e.g., Linux, Windows, iOS, Android
    const platform = process.platform;
    switch (platform) {
        case "linux":
            return "Linux";
        case "win32":
            return "Windows";
        case "darwin":
            return "macOS";
        default:
            return "Unknown";
    }
};
exports.platform = platform;
