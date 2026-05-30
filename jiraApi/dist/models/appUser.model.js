"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const dbUtils_1 = require("../utils/dbUtils");
const AppUser = {
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO app_user (user_key, username, email, display_name, password_hash, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            data.userKey,
            data.username,
            data.email ?? null,
            data.displayName ?? null,
            data.passwordHash ?? null,
            data.active ?? true,
        ]);
        return (0, dbUtils_1.toCamelCase)(result.rows[0]);
    },
    async findByEmail(email) {
        const result = await db_1.pool.query('SELECT * FROM app_user WHERE email = $1 LIMIT 1', [email]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async findOne(filter = {}) {
        const keys = Object.keys(filter);
        let query = 'SELECT * FROM app_user';
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
        const result = await db_1.pool.query('SELECT * FROM app_user WHERE id = $1', [id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async findAll() {
        const result = await db_1.pool.query('SELECT * FROM app_user ORDER BY id ASC');
        return result.rows.map(r => (0, dbUtils_1.toCamelCase)(r));
    },
    async update(id, data) {
        const keys = Object.keys(data);
        if (keys.length === 0)
            return this.findById(id);
        const sets = keys.map((k, i) => `${(0, dbUtils_1.toSnakeCase)(k)} = $${i + 1}`).join(', ');
        const result = await db_1.pool.query(`UPDATE app_user SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`, [...Object.values(data), id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
};
exports.default = AppUser;
