"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
//import { env } from "./config/environment";
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./config/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const USE_SSL = process.env.USE_SSL === 'true';
const PORT = parseInt(process.env.PORT || '3000', 10);
const SECURE_PORT = parseInt(process.env.SECURE_PORT || '8400', 10);
let server;
if (USE_SSL) {
    try {
        const options = {
            key: fs_1.default.readFileSync(process.env.SSL_KEY_PATH),
            cert: fs_1.default.readFileSync(process.env.SSL_CERT_PATH),
        };
        server = https_1.default.createServer(options, app_1.default);
        console.log(`Attempting to start Secure Server on https://localhost:${SECURE_PORT}`);
    }
    catch (error) {
        console.error('Failed to load SSL certificates. Falling back to HTTP server.', error);
        server = http_1.default.createServer(app_1.default);
        console.log(`Starting HTTP Server on http://localhost:${PORT} due to SSL error.`);
    }
}
else {
    server = http_1.default.createServer(app_1.default);
    console.log(`Starting HTTP Server on http://localhost:${PORT}`);
}
const startServer = async () => {
    await (0, db_1.connectDB)();
    server.listen(USE_SSL ? SECURE_PORT : PORT, () => {
        if (USE_SSL) {
            console.log(`Secure Server running on https://localhost:${SECURE_PORT}`);
        }
        else {
            console.log(`Server running on http://localhost:${PORT}`);
        }
    });
};
startServer().catch((error) => {
    console.error("Error starting server:", error);
    process.exit(1);
});
