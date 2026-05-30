"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_SUPERPROCTOR = exports.ROLE_CANDIDATE = exports.ROLE_PROCTOR = exports.ROLE_ADMIN = void 0;
exports.generateToken = generateToken;
exports.getAccessTokenCookieConfig = getAccessTokenCookieConfig;
exports.getConfiguration = getConfiguration;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
exports.ROLE_ADMIN = "admin";
exports.ROLE_PROCTOR = "proctor";
exports.ROLE_CANDIDATE = "candidate";
exports.ROLE_SUPERPROCTOR = "super_proctor";
function generateToken(payload, role) {
    const now = Math.floor(Date.now() / 1000);
    const secretKey = process.env.JWT_SECRET ?? "default_secret";
    const payloadData = {
        data: payload,
        role: role,
        iat: now,
    };
    return jsonwebtoken_1.default.sign(payloadData, secretKey, { algorithm: "HS256" });
}
function getAccessTokenCookieConfig(token, role = exports.ROLE_ADMIN) {
    const accessTokenExp = parseInt(process.env.ACCESS_TOKEN_EXP ?? "900");
    return {
        name: `access_token_${role}_${process.env.NODE_ENV}`,
        value: token,
        options: {
            maxAge: accessTokenExp * 1000,
            path: "/",
            domain: process.env.MAIN_DOMAIN || undefined,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "none",
        },
    };
}
function getConfiguration(socketName) {
    const socketUserName = socketName;
    const timestamp = Math.floor(Date.now() / 1000);
    const userId = socketUserName;
    const turnUsername = `${timestamp}:${userId}`;
    const staticAuthSecret = process.env.SDK_SECRET_KEY || '';
    // password = HMAC_SHA1(secret, username) and base64 encode it
    const turnPassword = crypto_1.default
        .createHmac("sha1", staticAuthSecret)
        .update(turnUsername)
        .digest("base64");
    const configuration = {
        url: process.env.SDK_URL,
        signal_node_url: process.env.SDK_SIGNAL_NODE_URL,
        recording_node_url: process.env.SDK_RECORDING_NODE_URL,
        turn_url: process.env.SDK_TURN_URL,
        stun_url: process.env.SDK_STUN_URL,
        turn_username: turnUsername,
        turn_password: turnPassword,
        stun_username: turnUsername,
        stun_password: turnPassword,
        env: process.env.SDK_ENV,
        speechURL: process.env.SDK_SPEECH_URL,
    };
    return btoa(JSON.stringify(configuration));
}
