import { Router } from 'express';
import { login, register, validateToken } from '../controllers/authController';

const router = Router();

router.post('/login', ...login);
router.post('/register', ...register);
router.post('/validate', validateToken);

export default router;