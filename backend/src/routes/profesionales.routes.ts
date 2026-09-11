import { Router } from 'express';
import { getProfesionales, getProfesionalById, updateDisponibilidad } from '../controllers/profesionales.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', getProfesionales);
router.get('/:id', getProfesionalById);
router.put('/:id/disponibilidad', updateDisponibilidad);

export default router;
