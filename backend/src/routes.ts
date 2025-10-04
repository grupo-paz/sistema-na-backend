import { Router } from 'express';
import AdminController from './controllers/AdminController';

const router = Router();
router.post('/admins', AdminController.create);

export default router;
