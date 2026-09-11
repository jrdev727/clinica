import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { getUsuarios, createUsuario, updateUsuario, toggleEstadoUsuario } from '../controllers/usuarios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { sudoMiddleware } from '../middlewares/sudo.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';

const router = Router();

router.use(authMiddleware);

// Solo ADMIN gestiona el equipo del centro médico
const soloAdmin = rbacMiddleware([RolUsuario.ADMIN]);

router.get('/', soloAdmin, getUsuarios);
router.post('/', soloAdmin, auditMiddleware('Usuario', 'Crear usuario del equipo'), createUsuario);
router.put('/:id', soloAdmin, auditMiddleware('Usuario', 'Editar usuario del equipo'), updateUsuario);
router.patch('/:id/estado', soloAdmin, sudoMiddleware, auditMiddleware('Usuario', 'Activar/desactivar usuario'), toggleEstadoUsuario);

export default router;
