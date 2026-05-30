import { Router } from 'express';
import { login, register, logout } from '../controllers/candidate/auth.controller';
import { getIssueTypes, getIssueStatuses, getPriorities, getUsers, getProjects } from '../controllers/candidate/lookup.controller';
import { createIssue, getIssueById, getProjectIssues, updateIssueStatus, getComments, addComment, getSubtasks, createSubtask, linkSubtask } from '../controllers/candidate/issue.controller';
import { getSprints, createSprint, updateSprint, startSprint, completeSprint, deleteSprint, addIssuesToSprint, removeIssueFromSprint } from '../controllers/candidate/sprint.controller';
import { requireAuth } from '../middlewares/requireAuth';

const router = Router();

/* auth */
router.post('/login',    login);
router.post('/register', register);
router.post('/logout',   logout);

/* lookups — public so the form can load without extra auth checks */
router.get('/issue-types',    getIssueTypes);
router.get('/issue-statuses', getIssueStatuses);
router.get('/priorities',     getPriorities);
router.get('/users',          getUsers);
router.get('/projects',       getProjects);

/* issues — require login */
router.post('/issues',                          requireAuth, createIssue);
router.get('/issues/:id',                       requireAuth, getIssueById);
router.get('/projects/:projectId/issues',       requireAuth, getProjectIssues);
router.patch('/issues/:id/status',              requireAuth, updateIssueStatus);
router.get('/issues/:id/comments',              requireAuth, getComments);
router.post('/issues/:id/comments',             requireAuth, addComment);
router.get('/issues/:id/subtasks',              requireAuth, getSubtasks);
router.post('/issues/:id/subtasks',             requireAuth, createSubtask);
router.put('/issues/:childId/parent',           requireAuth, linkSubtask);

/* sprints — require login */
router.get('/projects/:projectId/sprints',      requireAuth, getSprints);
router.post('/projects/:projectId/sprints',     requireAuth, createSprint);
router.put('/sprints/:id',                      requireAuth, updateSprint);
router.patch('/sprints/:id/start',              requireAuth, startSprint);
router.patch('/sprints/:id/complete',           requireAuth, completeSprint);
router.delete('/sprints/:id',                   requireAuth, deleteSprint);
router.post('/sprints/:id/issues',              requireAuth, addIssuesToSprint);
router.delete('/sprints/:id/issues/:issueId',   requireAuth, removeIssueFromSprint);

export default router;
