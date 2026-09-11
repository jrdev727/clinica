import { Router } from 'express';
import { registrarCobro, getPagos } from '../controllers/pagos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';
import { RolUsuario } from '@prisma/client';

const router = Router();
router.use(authMiddleware);

// Todos manejan la caja en este contexto
router.post('/', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.RECEPCION, RolUsuario.PROFESIONAL]), auditMiddleware('Pago', 'Registrar cobro'), registrarCobro);
router.get('/', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.RECEPCION, RolUsuario.PROFESIONAL]), getPagos);

export default router;
