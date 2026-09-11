import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { getAuditoria } from '../controllers/auditoria.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', rbacMiddleware([RolUsuario.ADMIN]), getAuditoria);

export default router;
