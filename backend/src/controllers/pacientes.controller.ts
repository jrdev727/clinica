import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getPacientes = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const centroMedicoId = req.user?.centroMedicoId;

    const pacientes = await prisma.paciente.findMany({
      where: {
        centroMedicoId,
        ...(search ? {
          OR: [
            { nombre: { contains: String(search), mode: 'insensitive' } },
            { apellido: { contains: String(search), mode: 'insensitive' } },
            { dni: { contains: String(search) } }
          ]
        } : {})
      },
      orderBy: { apellido: 'asc' }
    });

    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
};

export const getPacienteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        turnos: {
          orderBy: { fechaHoraInicio: 'desc' },
          take: 5
        }
      }
    });

    if (!paciente || paciente.centroMedicoId !== req.user?.centroMedicoId) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    res.json(paciente);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener paciente' });
  }
};

export const createPaciente = async (req: Request, res: Response) => {
  try {
    const centroMedicoId = req.user?.centroMedicoId!;
    const pacienteData = req.body;

    // Validar DNI único en el centro
    const existe = await prisma.paciente.findUnique({
      where: { centroMedicoId_dni: { centroMedicoId, dni: pacienteData.dni } }
    });

    if (existe) {
      return res.status(400).json({ message: 'Ya existe un paciente con este DNI' });
    }

    const paciente = await prisma.paciente.create({
      data: {
        ...pacienteData,
        centroMedicoId
      }
    });

    res.status(201).json(paciente);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear paciente' });
  }
};

export const updatePaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const pacienteData = req.body;
    const centroMedicoId = req.user?.centroMedicoId!;

    // Validar DNI si se intenta cambiar
    if (pacienteData.dni) {
      const existe = await prisma.paciente.findFirst({
        where: { centroMedicoId, dni: pacienteData.dni, id: { not: id } }
      });
      if (existe) {
        return res.status(400).json({ message: 'El DNI ya pertenece a otro paciente' });
      }
    }

    const paciente = await prisma.paciente.update({
      where: { id },
      data: pacienteData
    });

    res.json(paciente);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar paciente' });
  }
};

export const deletePaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.paciente.delete({
      where: { id }
    });
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar paciente' });
  }
};
