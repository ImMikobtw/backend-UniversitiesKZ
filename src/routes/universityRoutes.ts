import { Router } from 'express';
import { getUniversities, addUniversity } from '../controllers/universityController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getUniversities);
router.post('/', authMiddleware, addUniversity);

export default router;