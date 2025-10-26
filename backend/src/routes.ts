import { Router } from 'express';
import AdminController from './controllers/AdminController';
import SecretariatController from './controllers/SecretariatController';
import EventController from './controllers/EventController';
import authMiddleware from './middlewares/authMiddleware';

const router = Router();

// --- Rotas de Autenticação ---
router.post('/auth/login', AdminController.login);
router.post('/auth/refresh-token', AdminController.refreshToken);
router.post('/admins/define-password', AdminController.definePassword);
router.post('/auth/forgot-password', AdminController.forgotPassword);

// --- Rotas de Gestão de Administradores (Protegidas) ---
router.post('/auth/register', authMiddleware, AdminController.create);
router.post('/admins/change-password', authMiddleware, AdminController.changePassword);
router.get('/admins/:id', authMiddleware, AdminController.getProfile);
router.get('/admins', authMiddleware, AdminController.list);
router.put('/admins/:id', authMiddleware, AdminController.update);
router.delete('/admins/:id', authMiddleware, AdminController.delete);

// --- Rotas da Secretaria ---
router.post('/secretariat', authMiddleware, SecretariatController.create);
router.get('/secretariat', SecretariatController.getLatest);

// --- ROTAS DE EVENTOS
router.post('/events', authMiddleware, EventController.create);
router.get('/events', EventController.list);
router.get('/events/:id', EventController.getOne);
router.put('/events/:id', authMiddleware, EventController.update);
router.delete('/events/:id', authMiddleware, EventController.delete);


export default router;