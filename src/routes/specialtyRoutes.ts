import { Router } from 'express';
import { addSpecialty, getSpecialties } from '../controllers/specialtyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, addSpecialty);
router.get('/', authMiddleware, getSpecialties);

export default router;