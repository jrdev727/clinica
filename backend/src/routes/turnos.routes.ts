import { Router } from 'express';
import { getTurnos, createTurno, updateEstadoTurno, updateTurno, deleteTurno } from '../controllers/turnos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', getTurnos);
router.post('/', auditMiddleware('Turno', 'Crear turno'), createTurno);
router.patch('/:id/estado', auditMiddleware('Turno', 'Cambiar estado de turno'), updateEstadoTurno);
router.put('/:id', auditMiddleware('Turno', 'Editar turno'), updateTurno);
router.delete('/:id', auditMiddleware('Turno', 'Eliminar turno'), deleteTurno);

export default router;
