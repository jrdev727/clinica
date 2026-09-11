import { Request, Response, NextFunction } from 'express';
import { RolUsuario } from '@prisma/client';

export const rbacMiddleware = (rolesPermitidos: RolUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado: Rol insuficiente' });
    }

    next();
  };
};
