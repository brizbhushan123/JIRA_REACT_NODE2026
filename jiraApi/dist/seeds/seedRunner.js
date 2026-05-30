"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const utility_1 = require("../utils/utility");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const runSeed = async () => {
    try {
        await (0, db_1.connectDB)();
        utility_1.utility.log("🌱 Schema ready. Add seeders here as needed.");
        utility_1.utility.log("✅ Seed run complete");
        await db_1.pool.end();
        process.exit(0);
    }
    catch (error) {
        utility_1.utility.error("❌ Seed failed:", error);
        try {
            await db_1.pool.end();
        }
        catch (_) { }
        process.exit(1);
    }
};
runSeed();
