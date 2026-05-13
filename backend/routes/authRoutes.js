import { Router } from 'express';
import { register, login, updateProfile } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/register', register);
router.post('/login',    login);
router.patch('/profile', authMiddleware, updateProfile);
export default router;
