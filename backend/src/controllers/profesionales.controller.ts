import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getProfesionales = async (req: Request, res: Response) => {
  try {
    const { especialidad } = req.query;
    
    // Suponiendo que filtramos por centro médico del usuario actual
    const centroMedicoId = req.user?.centroMedicoId;

    const profesionales = await prisma.profesional.findMany({
      where: {
        usuario: { centroMedicoId, activo: true },
        ...(especialidad ? { especialidad: { contains: String(especialidad), mode: 'insensitive' } } : {})
      },
      include: {
        disponibilidades: true,
        usuario: { select: { email: true } }
      }
    });

    res.json(profesionales);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener profesionales' });
  }
};

export const getProfesionalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const centroMedicoId = req.user?.centroMedicoId;

    const profesional = await prisma.profesional.findFirst({
      where: {
        id,
        usuario: { centroMedicoId }
      },
      include: {
        disponibilidades: true
      }
    });

    if (!profesional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    res.json(profesional);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener profesional' });
  }
};

export const updateDisponibilidad = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { disponibilidades } = req.body; // Array de { diaSemana, horaInicio, horaFin }

    // Validar acceso: Solo ADMIN o el propio profesional pueden modificar esto
    if (req.user?.rol !== 'ADMIN' && req.user?.profesionalId !== id) {
       return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Borramos disponibilidades anteriores y creamos las nuevas (transacción)
    await prisma.$transaction([
      prisma.disponibilidadHoraria.deleteMany({ where: { profesionalId: id } }),
      prisma.disponibilidadHoraria.createMany({
        data: disponibilidades.map((d: any) => ({
          ...d,
          profesionalId: id
        }))
      })
    ]);

    res.json({ message: 'Disponibilidad actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar disponibilidad' });
  }
};
