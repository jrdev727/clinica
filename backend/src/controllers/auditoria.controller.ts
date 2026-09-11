import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAuditoria = async (req: Request, res: Response) => {
  try {
    const centroMedicoId = req.user?.centroMedicoId;

    const logs = await prisma.auditoriaLog.findMany({
      where: { usuario: { centroMedicoId } },
      include: {
        usuario: {
          select: {
            username: true,
            nombre: true,
            apellido: true,
            profesional: { select: { nombre: true, apellido: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el registro de auditoría' });
  }
};
