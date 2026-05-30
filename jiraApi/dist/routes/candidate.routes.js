"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/candidate/auth.controller");
const lookup_controller_1 = require("../controllers/candidate/lookup.controller");
const issue_controller_1 = require("../controllers/candidate/issue.controller");
const requireAuth_1 = require("../middlewares/requireAuth");
const router = (0, express_1.Router)();
/* auth */
router.post('/login', auth_controller_1.login);
router.post('/register', auth_controller_1.register);
router.post('/logout', auth_controller_1.logout);
/* lookups — public so the form can load without extra auth checks */
router.get('/issue-types', lookup_controller_1.getIssueTypes);
router.get('/issue-statuses', lookup_controller_1.getIssueStatuses);
router.get('/priorities', lookup_controller_1.getPriorities);
router.get('/users', lookup_controller_1.getUsers);
router.get('/projects', lookup_controller_1.getProjects);
/* issues — require login */
router.post('/issues', requireAuth_1.requireAuth, issue_controller_1.createIssue);
router.get('/issues/:id', requireAuth_1.requireAuth, issue_controller_1.getIssueById);
router.get('/projects/:projectId/issues', requireAuth_1.requireAuth, issue_controller_1.getProjectIssues);
router.patch('/issues/:id/status', requireAuth_1.requireAuth, issue_controller_1.updateIssueStatus);
router.get('/issues/:id/comments', requireAuth_1.requireAuth, issue_controller_1.getComments);
router.post('/issues/:id/comments', requireAuth_1.requireAuth, issue_controller_1.addComment);
exports.default = router;
