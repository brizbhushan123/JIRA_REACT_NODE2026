"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const dbUtils_1 = require("../utils/dbUtils");
const AdminLogin = {
    async findByEmail(email) {
        const result = await db_1.pool.query('SELECT * FROM admin_login WHERE email = $1 LIMIT 1', [email]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async findById(id) {
        const result = await db_1.pool.query('SELECT * FROM admin_login WHERE id = $1 LIMIT 1', [id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
};
exports.default = AdminLogin;
