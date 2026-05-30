"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const dbUtils_1 = require("../utils/dbUtils");
const Worklog = {
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO worklog (issue_id, author_id, timeworked, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [data.issueId, data.authorId ?? null, data.timeworked ?? null, data.comment ?? null]);
        return (0, dbUtils_1.toCamelCase)(result.rows[0]);
    },
    async findOne(filter = {}) {
        const keys = Object.keys(filter);
        let query = 'SELECT * FROM worklog';
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
        const result = await db_1.pool.query('SELECT * FROM worklog WHERE id = $1', [id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async findByIssue(issueId) {
        const result = await db_1.pool.query('SELECT * FROM worklog WHERE issue_id = $1 ORDER BY created ASC', [issueId]);
        return result.rows.map(r => (0, dbUtils_1.toCamelCase)(r));
    },
    async delete(id) {
        const result = await db_1.pool.query('DELETE FROM worklog WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    },
};
exports.default = Worklog;
