import { Router } from 'express';
import { getHistorialPaciente, createEvolucion, firmarEvolucion, getAdjunto } from '../controllers/historiasClinicas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/paciente/:pacienteId', getHistorialPaciente);
router.get('/adjuntos/:filename', getAdjunto);
router.post('/', uploadMiddleware.array('archivos', 5), auditMiddleware('HistoriaClinica', 'Crear evolución clínica'), createEvolucion);
router.post('/:id/firmar', auditMiddleware('HistoriaClinica', 'Firmar evolución clínica'), firmarEvolucion);

export default router;
