import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// "antecedentes" es información clínica (motivo de consulta, historial de
// salud mental, etc.) aunque viva en la ficha básica del paciente. Recepción
// puede crear/editar pacientes para agendar, pero no debe leer ni escribir
// ese campo — misma regla de confidencialidad que el resto de la historia
// clínica.
const ocultarAntecedentesSiCorresponde = (paciente: any, rol?: string) => {
  if (rol !== 'RECEPCION') return paciente;
  const { antecedentes, ...resto } = paciente;
  return resto;
};

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

    res.json(pacientes.map(p => ocultarAntecedentesSiCorresponde(p, req.user?.rol)));
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

    res.json(ocultarAntecedentesSiCorresponde(paciente, req.user?.rol));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener paciente' });
  }
};

export const createPaciente = async (req: Request, res: Response) => {
  try {
    const centroMedicoId = req.user?.centroMedicoId!;
    const pacienteData = { ...req.body };

    // Recepción no puede cargar antecedentes clínicos, ni siquiera armando
    // el pedido a mano: se ignora cualquier valor que mande para ese campo.
    if (req.user?.rol === 'RECEPCION') {
      delete pacienteData.antecedentes;
    }

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

    res.status(201).json(ocultarAntecedentesSiCorresponde(paciente, req.user?.rol));
  } catch (error) {
    res.status(500).json({ message: 'Error al crear paciente' });
  }
};

export const updatePaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const centroMedicoId = req.user?.centroMedicoId!;
    const pacienteData = { ...req.body };

    if (req.user?.rol === 'RECEPCION') {
      delete pacienteData.antecedentes;
    }

    const pacienteExistente = await prisma.paciente.findFirst({ where: { id, centroMedicoId } });
    if (!pacienteExistente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

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

    res.json(ocultarAntecedentesSiCorresponde(paciente, req.user?.rol));
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar paciente' });
  }
};

export const deletePaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const centroMedicoId = req.user?.centroMedicoId;

    const paciente = await prisma.paciente.findFirst({ where: { id, centroMedicoId } });
    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    await prisma.paciente.delete({ where: { id } });
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar paciente' });
  }
};
