import { Router } from 'express';
import { getPacientes, getPacienteById, createPaciente, updatePaciente, deletePaciente } from '../controllers/pacientes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbacMiddleware } from '../middlewares/rbac.middleware';
import { sudoMiddleware } from '../middlewares/sudo.middleware';
import { auditMiddleware } from '../middlewares/audit.middleware';
import { RolUsuario } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

// Todos los roles pueden ver pacientes
router.get('/', getPacientes);
router.get('/:id', getPacienteById);

// Permitir crear/editar/eliminar a ADMIN, RECEPCION y PROFESIONAL
const rolesPermitidos = [RolUsuario.ADMIN, RolUsuario.RECEPCION, RolUsuario.PROFESIONAL];
router.post('/', rbacMiddleware(rolesPermitidos), auditMiddleware('Paciente', 'Crear paciente'), createPaciente);
router.put('/:id', rbacMiddleware(rolesPermitidos), auditMiddleware('Paciente', 'Editar paciente'), updatePaciente);
router.delete('/:id', rbacMiddleware(rolesPermitidos), sudoMiddleware, auditMiddleware('Paciente', 'Eliminar paciente'), deletePaciente);

export default router;
