import { Router } from "express";
import { adminLogin, adminLogout } from "../controllers/admin/auth.controller";
import { createClient } from "../controllers/admin/client.controller";
import { deleteUser, getUsers, updateUser } from "../controllers/admin/user.controller";
import { getProjectIssues } from '../controllers/candidate/issue.controller';
import { getProjectsAdmin, createProject, updateProject, deleteProject } from '../controllers/admin/project.controller';

const router = Router();

router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.post('/create-client', createClient);
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.get('/projects/:projectId/issues', getProjectIssues);
router.get('/projects', getProjectsAdmin);
router.post('/projects', createProject);
router.put('/projects/:projectId', updateProject);
router.delete('/projects/:projectId', deleteProject);


export default router;
