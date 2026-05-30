"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = require("pg");
const schema_1 = require("./schema");
exports.pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_DATABASE || 'jira_db',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
});
const connectDB = async () => {
    try {
        const client = await exports.pool.connect();
        client.release();
        console.log('✅ PostgreSQL connected successfully');
        await (0, schema_1.initSchema)();
    }
    catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
