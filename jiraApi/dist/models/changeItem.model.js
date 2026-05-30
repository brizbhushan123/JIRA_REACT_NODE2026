"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const dbUtils_1 = require("../utils/dbUtils");
const ChangeItem = {
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO changeitem (group_id, fieldtype, field, oldvalue, oldstring, newvalue, newstring)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [
            data.groupId,
            data.fieldtype ?? null,
            data.field ?? null,
            data.oldvalue ?? null,
            data.oldstring ?? null,
            data.newvalue ?? null,
            data.newstring ?? null,
        ]);
        return (0, dbUtils_1.toCamelCase)(result.rows[0]);
    },
    async findOne(filter = {}) {
        const keys = Object.keys(filter);
        let query = 'SELECT * FROM changeitem';
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
    async findByGroup(groupId) {
        const result = await db_1.pool.query('SELECT * FROM changeitem WHERE group_id = $1 ORDER BY id ASC', [groupId]);
        return result.rows.map(r => (0, dbUtils_1.toCamelCase)(r));
    },
};
exports.default = ChangeItem;
