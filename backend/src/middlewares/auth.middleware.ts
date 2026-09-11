import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '@prisma/client';
import { JWT_SECRET } from '../lib/env';

export interface AuthPayload {
  usuarioId: string;
  centroMedicoId: string;
  rol: RolUsuario;
  profesionalId?: string;
}

// Ampliamos el request de Express
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado: Token no provisto' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;

    // Opcional: Verificar que el usuario sigue activo
    const usuario = await prisma.usuario.findUnique({ where: { id: decoded.usuarioId } });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ message: 'No autorizado: Usuario inactivo o no encontrado' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'No autorizado: Token inválido' });
  }
};
