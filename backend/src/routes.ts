import { Router } from 'express';
import AdminController from './controllers/AdminController';
import SecretariatController from './controllers/SecretariatController';
import authMiddleware from './middlewares/authMiddleware';

const router = Router();

router.post('/auth/login', AdminController.login);
router.post('/auth/refresh-token', AdminController.refreshToken);
router.post('/admins/define-password', AdminController.definePassword);
router.post('/auth/forgot-password', AdminController.forgotPassword);

router.post('/auth/register', authMiddleware, AdminController.create);
router.post('/admins/change-password', authMiddleware, AdminController.changePassword);
router.get('/admins/:id', authMiddleware, AdminController.getProfile);
router.get('/admins', authMiddleware, AdminController.list);
router.put('/admins/:id', authMiddleware, AdminController.update);
router.delete('/admins/:id', authMiddleware, AdminController.delete);

router.post('/secretariat', authMiddleware, SecretariatController.create);

router.get('/secretariat', SecretariatController.getLatest);


export default router;