"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const dbUtils_1 = require("../utils/dbUtils");
const ProjectVersion = {
    async create(data) {
        const result = await db_1.pool.query(`INSERT INTO projectversion (project_id, vname, released, archived, startdate, releasedate)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            data.projectId ?? null,
            data.vname ?? null,
            data.released ?? false,
            data.archived ?? false,
            data.startdate ?? null,
            data.releasedate ?? null,
        ]);
        return (0, dbUtils_1.toCamelCase)(result.rows[0]);
    },
    async findOne(filter = {}) {
        const keys = Object.keys(filter);
        let query = 'SELECT * FROM projectversion';
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
    async findByProject(projectId) {
        const result = await db_1.pool.query('SELECT * FROM projectversion WHERE project_id = $1 ORDER BY id ASC', [projectId]);
        return result.rows.map(r => (0, dbUtils_1.toCamelCase)(r));
    },
    async update(id, data) {
        const keys = Object.keys(data);
        if (keys.length === 0)
            return null;
        const sets = keys.map((k, i) => `${(0, dbUtils_1.toSnakeCase)(k)} = $${i + 1}`).join(', ');
        const result = await db_1.pool.query(`UPDATE projectversion SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`, [...Object.values(data), id]);
        return result.rows[0] ? (0, dbUtils_1.toCamelCase)(result.rows[0]) : null;
    },
};
exports.default = ProjectVersion;
