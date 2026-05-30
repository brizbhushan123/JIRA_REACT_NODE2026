"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const dbUtils_1 = require("../utils/dbUtils");
const JiraIssue = {
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO jiraissue
         (issue_num, pkey, project_id, reporter_id, assignee_id, creator_id,
          issuetype_id, issuestatus_id, priority_id, resolution_id,
          summary, description, environment, duedate)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`, [
            data.issueNum ?? null,
            data.pkey,
            data.projectId ?? null,
            data.reporterId ?? null,
            data.assigneeId ?? null,
            data.creatorId ?? null,
            data.issuetypeId ?? null,
            data.issuestatusId ?? null,
            data.priorityId ?? null,
            data.resolutionId ?? null,
            data.summary,
            data.description ?? null,
            data.environment ?? null,
            data.duedate ?? null,
        ]);
        return (0, dbUtils_1.toCamelCase)(result.rows[0]);
    },
    async findOne(filter = {}) {
        const keys = Object.keys(filter);
        let query = 'SELECT * FROM jiraissue';
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
        const result = await db_1.pool.query('SELECT * FROM jiraissue WHERE id = $1', [id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async findByProject(projectId) {
        const result = await db_1.pool.query('SELECT * FROM jiraissue WHERE project_id = $1 ORDER BY id ASC', [projectId]);
        return result.rows.map(r => (0, dbUtils_1.toCamelCase)(r));
    },
    async update(id, data) {
        const keys = Object.keys(data);
        if (keys.length === 0)
            return this.findById(id);
        const sets = keys.map((k, i) => `${(0, dbUtils_1.toSnakeCase)(k)} = $${i + 1}`).join(', ');
        const result = await db_1.pool.query(`UPDATE jiraissue SET ${sets}, updated = NOW() WHERE id = $${keys.length + 1} RETURNING *`, [...Object.values(data), id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
    async delete(id) {
        const result = await db_1.pool.query('DELETE FROM jiraissue WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    },
};
exports.default = JiraIssue;
