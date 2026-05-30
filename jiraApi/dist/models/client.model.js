"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const dbUtils_1 = require("../utils/dbUtils");
const Client = {
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO clients
         (is_active, expiry_date, created_by, api_key, secret_key, time_zone, retention_days, date_format, default_language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
            data.isActive ?? true,
            data.expiryDate,
            data.createdBy ?? null,
            data.apiKey,
            data.secretKey,
            data.timeZone ?? 'Asia/Kolkata',
            data.retentionDays ?? 1,
            data.dateFormat ?? 'DD/MM/YYYY',
            data.defaultLanguage ?? 'en',
        ]);
        return (0, dbUtils_1.toCamelCase)(result.rows[0]);
    },
    async findOne(filter = {}) {
        const keys = Object.keys(filter);
        let query = 'SELECT * FROM clients';
        const values = [];
        if (keys.length > 0) {
            const conditions = keys.map((k, i) => `${(0, dbUtils_1.toSnakeCase)(k)} = $${i + 1}`).join(' AND ');
            query += ` WHERE ${conditions}`;
            values.push(...Object.values(filter));
        }
        query += ' ORDER BY id ASC LIMIT 1';
        const result = await db_1.pool.query(query, values);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async findById(id) {
        const result = await db_1.pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async findByApiKey(apiKey) {
        const result = await db_1.pool.query('SELECT * FROM clients WHERE api_key = $1 LIMIT 1', [apiKey]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async insertOrIgnore(data) {
        await db_1.pool.query(`INSERT INTO clients
         (is_active, expiry_date, created_by, api_key, secret_key, time_zone, retention_days, date_format, default_language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (api_key) DO NOTHING`, [
            data.isActive ?? true,
            data.expiryDate,
            data.createdBy ?? null,
            data.apiKey,
            data.secretKey,
            data.timeZone ?? 'Asia/Kolkata',
            data.retentionDays ?? 1,
            data.dateFormat ?? 'DD/MM/YYYY',
            data.defaultLanguage ?? 'en',
        ]);
    },
};
exports.default = Client;
