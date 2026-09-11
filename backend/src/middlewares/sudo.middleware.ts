import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export const verifySudoPassword = async (userId: string, sudoPassword?: string) => {
  if (!sudoPassword) return { valid: false, reason: 'SUDO_REQUIRED', detail: 'Esta acción crítica requiere tu contraseña.' };
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) return { valid: false, reason: 'USER_NOT_FOUND', detail: 'Usuario no encontrado' };
  const isMatch = await bcrypt.compare(sudoPassword, usuario.passwordHash);
  if (!isMatch) return { valid: false, reason: 'SUDO_INVALID', detail: 'Contraseña incorrecta.' };
  return { valid: true };
};

export const sudoMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sudoPassword = req.headers['x-sudo-password'] as string;
    const userId = req.user?.usuarioId;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    const result = await verifySudoPassword(userId, sudoPassword);
    if (!result.valid) {
      return res.status(403).json({ message: result.reason, detail: result.detail });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar credenciales de seguridad' });
  }
};