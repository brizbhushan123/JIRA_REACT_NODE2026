"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const dbUtils_1 = require("../utils/dbUtils");
const JiraAction = {
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO jiraaction (issue_id, author_id, actionbody)
       VALUES ($1, $2, $3)
       RETURNING *`, [data.issueId, data.authorId ?? null, data.actionbody]);
        return (0, dbUtils_1.toCamelCase)(result.rows[0]);
    },
    async findOne(filter = {}) {
        const keys = Object.keys(filter);
        let query = 'SELECT * FROM jiraaction';
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
        const result = await db_1.pool.query('SELECT * FROM jiraaction WHERE id = $1', [id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async findByIssue(issueId) {
        const result = await db_1.pool.query('SELECT * FROM jiraaction WHERE issue_id = $1 ORDER BY created ASC', [issueId]);
        return result.rows.map(r => (0, dbUtils_1.toCamelCase)(r));
    },
    async update(id, actionbody) {
        const result = await db_1.pool.query(`UPDATE jiraaction SET actionbody = $1, updated = NOW() WHERE id = $2 RETURNING *`, [actionbody, id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async delete(id) {
        const result = await db_1.pool.query('DELETE FROM jiraaction WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    },
};
exports.default = JiraAction;
