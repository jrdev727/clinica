import { Router } from 'express';
import { getDerivacionesPaciente, createDerivacion, getAdjuntoDerivacion } from '../controllers/derivaciones.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/paciente/:pacienteId', getDerivacionesPaciente);
router.get('/adjuntos/:filename', getAdjuntoDerivacion);
router.post('/', uploadMiddleware.single('adjunto'), auditMiddleware('Derivacion', 'Crear derivación'), createDerivacion);

export default router;
