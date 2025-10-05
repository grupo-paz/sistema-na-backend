import { Router } from 'express';
import AdminController from './controllers/AdminController';
import authMiddleware from './middlewares/authMiddleware';

const router = Router();

router.post('/auth/register', authMiddleware, AdminController.create);
router.post('/auth/login', AdminController.login);
router.post('/admins/define-password', AdminController.definePassword);

export default router;
