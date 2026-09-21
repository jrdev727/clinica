import { Router } from 'express';
import { registrarCobro, getPagos, anularPago } from '../controllers/pagos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { sudoMiddleware } from '../middlewares/sudo.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';
import { RolUsuario } from '@prisma/client';

const router = Router();
router.use(authMiddleware);

// Recepción no maneja la caja: solo turnos y fichas de pacientes.
router.post('/', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.PROFESIONAL]), auditMiddleware('Pago', 'Registrar cobro'), registrarCobro);
router.get('/', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.PROFESIONAL]), getPagos);
router.patch('/:id/anular', rbacMiddleware([RolUsuario.ADMIN, RolUsuario.PROFESIONAL]), sudoMiddleware, auditMiddleware('Pago', 'Anular pago'), anularPago);

export default router;
