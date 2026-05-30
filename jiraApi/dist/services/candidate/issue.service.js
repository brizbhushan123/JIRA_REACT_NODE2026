"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIssueStatusService = exports.addCommentService = exports.getCommentsService = exports.getIssueByIdService = exports.getProjectIssuesService = exports.createIssueService = void 0;
const jiraIssue_model_1 = __importDefault(require("../../models/jiraIssue.model"));
const jiraAction_model_1 = __importDefault(require("../../models/jiraAction.model"));
const issueStatus_model_1 = __importDefault(require("../../models/issueStatus.model"));
const project_model_1 = __importDefault(require("../../models/project.model"));
const db_1 = require("../../config/db");
const dbUtils_1 = require("../../utils/dbUtils");
const serviceResponse_1 = require("../../utils/serviceResponse");
const createIssueService = async (req) => {
    try {
        const { projectId, summary, description, issuetypeId, priorityId, assigneeId, duedate } = req.body;
        const project = await project_model_1.default.findById(Number(projectId));
        if (!project)
            return serviceResponse_1.serviceResponse.error('PROJECT_NOT_FOUND', {}, 404);
        const todoStatus = await issueStatus_model_1.default.findOne({ pname: 'To Do' });
        if (!todoStatus)
            return serviceResponse_1.serviceResponse.error('STATUS_NOT_CONFIGURED', {}, 500);
        const countResult = await db_1.pool.query('SELECT COUNT(*) FROM jiraissue WHERE project_id = $1', [projectId]);
        const issueNum = parseInt(countResult.rows[0].count) + 1;
        const pkey = `${project.pkey}-${issueNum}`;
        const issue = await jiraIssue_model_1.default.create({
            issueNum,
            pkey,
            projectId: Number(projectId),
            summary,
            description: description ?? null,
            issuetypeId: Number(issuetypeId),
            issuestatusId: todoStatus.id,
            priorityId: priorityId ? Number(priorityId) : null,
            assigneeId: assigneeId ? Number(assigneeId) : null,
            reporterId: req.authUser?.id ?? null,
            creatorId: req.authUser?.id ?? null,
            duedate: duedate ? new Date(duedate) : null,
        });
        return serviceResponse_1.serviceResponse.success('ISSUE_CREATED', { issue }, 201);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.createIssueService = createIssueService;
const getProjectIssuesService = async (req) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const result = await db_1.pool.query(`SELECT
         j.id,
         j.issue_num,
         j.pkey,
         j.summary,
         j.description,
         j.duedate,
         j.created,
         j.updated,
         j.project_id,
         j.reporter_id,
         j.assignee_id,
         j.creator_id,
         j.issuetype_id,
         j.issuestatus_id,
         j.priority_id,
         it.pname             AS type,
         UPPER(ist.pname)     AS status,
         pr.pname             AS priority
       FROM jiraissue j
       LEFT JOIN issuetype   it  ON j.issuetype_id   = it.id
       LEFT JOIN issuestatus ist ON j.issuestatus_id  = ist.id
       LEFT JOIN priority    pr  ON j.priority_id     = pr.id
       WHERE j.project_id = $1
       ORDER BY j.id DESC`, [projectId]);
        const data = result.rows.map(r => (0, dbUtils_1.toCamelCase)(r));
        return serviceResponse_1.serviceResponse.success('DATA_FETCHED', data);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.getProjectIssuesService = getProjectIssuesService;
const getIssueByIdService = async (req) => {
    try {
        const id = parseInt(req.params.id);
        const result = await db_1.pool.query(`SELECT
         j.id,
         j.issue_num,
         j.pkey,
         j.summary,
         j.description,
         j.environment,
         j.duedate,
         j.created,
         j.updated,
         j.project_id,
         j.reporter_id,
         j.assignee_id,
         j.creator_id,
         j.issuetype_id,
         j.issuestatus_id,
         j.priority_id,
         it.pname              AS type,
         UPPER(ist.pname)      AS status,
         pr.pname              AS priority,
         p.pname               AS project_name,
         p.pkey                AS project_key,
         a.username            AS assignee_username,
         a.display_name        AS assignee_display_name,
         r.username            AS reporter_username,
         r.display_name        AS reporter_display_name
       FROM jiraissue j
       LEFT JOIN issuetype   it  ON j.issuetype_id  = it.id
       LEFT JOIN issuestatus ist ON j.issuestatus_id = ist.id
       LEFT JOIN priority    pr  ON j.priority_id    = pr.id
       LEFT JOIN project     p   ON j.project_id     = p.id
       LEFT JOIN app_user    a   ON j.assignee_id    = a.id
       LEFT JOIN app_user    r   ON j.reporter_id    = r.id
       WHERE j.id = $1`, [id]);
        if (result.rows.length === 0) {
            return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', { message: 'Issue not found' }, 404);
        }
        return serviceResponse_1.serviceResponse.success('DATA_FETCHED', (0, dbUtils_1.toCamelCase)(result.rows[0]));
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.getIssueByIdService = getIssueByIdService;
const getCommentsService = async (req) => {
    try {
        const issueId = parseInt(req.params.id);
        const result = await db_1.pool.query(`SELECT
         ja.id,
         ja.issue_id,
         ja.author_id,
         ja.actionbody,
         ja.created,
         ja.updated,
         u.username            AS author_username,
         u.display_name        AS author_display_name
       FROM jiraaction ja
       LEFT JOIN app_user u ON ja.author_id = u.id
       WHERE ja.issue_id = $1
       ORDER BY ja.created ASC`, [issueId]);
        return serviceResponse_1.serviceResponse.success('DATA_FETCHED', result.rows.map(r => (0, dbUtils_1.toCamelCase)(r)));
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.getCommentsService = getCommentsService;
const addCommentService = async (req) => {
    try {
        const issueId = parseInt(req.params.id);
        const { body: commentBody } = req.body;
        const comment = await jiraAction_model_1.default.create({
            issueId,
            authorId: req.authUser?.id ?? null,
            actionbody: commentBody,
        });
        const enriched = await db_1.pool.query(`SELECT
         ja.id, ja.issue_id, ja.author_id, ja.actionbody, ja.created, ja.updated,
         u.username AS author_username, u.display_name AS author_display_name
       FROM jiraaction ja
       LEFT JOIN app_user u ON ja.author_id = u.id
       WHERE ja.id = $1`, [comment.id]);
        return serviceResponse_1.serviceResponse.success('COMMENT_ADDED', (0, dbUtils_1.toCamelCase)(enriched.rows[0]), 201);
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.addCommentService = addCommentService;
const updateIssueStatusService = async (req) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        if (!status)
            return serviceResponse_1.serviceResponse.error('VALIDATION_ERROR', { status: 'status is required' }, 400);
        const result = await db_1.pool.query(`UPDATE jiraissue
       SET issuestatus_id = (
         SELECT id FROM issuestatus WHERE UPPER(pname) = UPPER($2) LIMIT 1
       ),
       updated = NOW()
       WHERE id = $1
       RETURNING id`, [id, status]);
        if ((result.rowCount ?? 0) === 0) {
            return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', { message: 'Issue not found or status invalid' }, 404);
        }
        return serviceResponse_1.serviceResponse.success('DEFAULT', { id });
    }
    catch (error) {
        return serviceResponse_1.serviceResponse.error('INTERNAL_SERVER_ERROR', error, 500);
    }
};
exports.updateIssueStatusService = updateIssueStatusService;
