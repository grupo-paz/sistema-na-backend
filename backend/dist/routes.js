"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = __importDefault(require("./controllers/AdminController"));
const SecretariatController_1 = __importDefault(require("./controllers/SecretariatController"));
const EventController_1 = __importDefault(require("./controllers/EventController"));
const MeetingController_1 = __importDefault(require("./controllers/MeetingController"));
const authMiddleware_1 = __importDefault(require("./middlewares/authMiddleware"));
const router = (0, express_1.Router)();
//Rotas de Autenticação
router.post('/auth/login', AdminController_1.default.login);
router.post('/auth/refresh-token', AdminController_1.default.refreshToken);
router.post('/admins/define-password', AdminController_1.default.definePassword);
router.post('/auth/forgot-password', AdminController_1.default.forgotPassword);
//Rotas de Gestão de Administradores (Protegidas)
router.post('/auth/register', authMiddleware_1.default, AdminController_1.default.create);
router.post('/admins/change-password', authMiddleware_1.default, AdminController_1.default.changePassword);
router.get('/admins/:id', authMiddleware_1.default, AdminController_1.default.getProfile);
router.get('/admins', authMiddleware_1.default, AdminController_1.default.list);
router.put('/admins/:id', authMiddleware_1.default, AdminController_1.default.update);
router.delete('/admins/:id', authMiddleware_1.default, AdminController_1.default.delete);
//Rotas da Secretaria
router.post('/secretariat', authMiddleware_1.default, SecretariatController_1.default.create);
router.get('/secretariat', SecretariatController_1.default.getLatest);
//Rotas de Eventos
router.post('/events', authMiddleware_1.default, EventController_1.default.create);
router.get('/events', EventController_1.default.list);
// Rota para buscar o próximo evento (Pública)
router.get('/events/next', EventController_1.default.getNext);
// Rota para buscar um evento específico (Pública)
router.get('/events/:id', EventController_1.default.getOne);
// Rota para atualizar um evento (Protegida)
router.put('/events/:id', authMiddleware_1.default, EventController_1.default.update);
// Rota para excluir um evento (Protegida)
router.delete('/events/:id', authMiddleware_1.default, EventController_1.default.delete);
//Rotas de Reuniões
router.post('/meetings', authMiddleware_1.default, MeetingController_1.default.create);
router.get('/meetings', MeetingController_1.default.list);
router.get('/meetings/today', MeetingController_1.default.getTodayMeetings);
router.get('/meetings/:id', MeetingController_1.default.getOne);
router.put('/meetings/:id', authMiddleware_1.default, MeetingController_1.default.update);
router.delete('/meetings/:id', authMiddleware_1.default, MeetingController_1.default.delete);
exports.default = router;
