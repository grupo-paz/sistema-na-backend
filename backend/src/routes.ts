import { Router } from 'express';
import AdminController from './controllers/AdminController';
import SecretariatController from './controllers/SecretariatController';
import EventController from './controllers/EventController';
import MeetingController from './controllers/MeetingController';
import authMiddleware from './middlewares/authMiddleware';

const router = Router();

//Rotas de Autenticação
router.post('/auth/login', AdminController.login);
router.post('/auth/refresh-token', AdminController.refreshToken);
router.post('/admins/define-password', AdminController.definePassword);
router.post('/auth/forgot-password', AdminController.forgotPassword);

//Rotas de Gestão de Administradores (Protegidas)
router.post('/auth/register', authMiddleware, AdminController.create);
router.post('/admins/change-password', authMiddleware, AdminController.changePassword);
router.get('/admins/:id', authMiddleware, AdminController.getProfile);
router.get('/admins', authMiddleware, AdminController.list);
router.put('/admins/:id', authMiddleware, AdminController.update);
router.delete('/admins/:id', authMiddleware, AdminController.delete);

//Rotas da Secretaria
router.post('/secretariat', authMiddleware, SecretariatController.create);
router.get('/secretariat', SecretariatController.getLatest);

//Rotas de Eventos
router.post('/events', authMiddleware, EventController.create);
router.get('/events', EventController.list);

// Rota para buscar o próximo evento (Pública)
router.get('/events/next', EventController.getNext);

// Rota para buscar um evento específico (Pública)
router.get('/events/:id', EventController.getOne);

// Rota para atualizar um evento (Protegida)
router.put('/events/:id', authMiddleware, EventController.update);

// Rota para excluir um evento (Protegida)
router.delete('/events/:id', authMiddleware, EventController.delete);

//Rotas de Reuniões
router.post('/meetings', authMiddleware, MeetingController.create);
router.get('/meetings', MeetingController.list);
router.get('/meetings/today', MeetingController.getTodayMeetings);
router.get('/meetings/:id', MeetingController.getOne);
router.put('/meetings/:id', authMiddleware, MeetingController.update);
router.delete('/meetings/:id', authMiddleware, MeetingController.delete);


export default router;