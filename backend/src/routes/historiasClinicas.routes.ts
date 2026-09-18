import { Router } from 'express';
import { getHistorialPaciente, createEvolucion, firmarEvolucion, getAdjunto, deleteEvolucion } from '../controllers/historiasClinicas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';
import { sudoMiddleware } from '../middlewares/sudo.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/paciente/:pacienteId', getHistorialPaciente);
router.get('/adjuntos/:filename', getAdjunto);
router.post('/', uploadMiddleware.array('archivos', 5), auditMiddleware('HistoriaClinica', 'Crear evolución clínica'), createEvolucion);
router.post('/:id/firmar', auditMiddleware('HistoriaClinica', 'Firmar evolución clínica'), firmarEvolucion);
router.delete('/:id', sudoMiddleware, auditMiddleware('HistoriaClinica', 'Eliminar evolución clínica'), deleteEvolucion);

export default router;
