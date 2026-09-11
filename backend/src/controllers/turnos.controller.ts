import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EstadoTurno } from '@prisma/client';
import { verifySudoPassword } from '../middlewares/sudo.middleware';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Devuelve un mensaje de error si el turno cae fuera de la disponibilidad horaria
// configurada por el profesional. Si el profesional todavía no configuró ninguna
// disponibilidad, no se restringe (evita bloquear a quien recién se suma al equipo).
const validarDisponibilidadHoraria = async (profesionalId: string, inicio: Date, fin: Date) => {
  const disponibilidades = await prisma.disponibilidadHoraria.findMany({ where: { profesionalId } });
  if (disponibilidades.length === 0) return null;

  const diaSemana = inicio.getDay();
  const minutosInicio = inicio.getHours() * 60 + inicio.getMinutes();
  const minutosFin = fin.getHours() * 60 + fin.getMinutes();

  const disponibilidadDelDia = disponibilidades.filter(d => d.diaSemana === diaSemana);
  if (disponibilidadDelDia.length === 0) {
    return `Fuera de horario: no hay atención configurada los días ${DIAS[diaSemana]}.`;
  }

  const cabeEnAlgunBloque = disponibilidadDelDia.some(d => {
    const [hI, mI] = d.horaInicio.split(':').map(Number);
    const [hF, mF] = d.horaFin.split(':').map(Number);
    return minutosInicio >= hI * 60 + mI && minutosFin <= hF * 60 + mF;
  });

  if (!cabeEnAlgunBloque) {
    const horarios = disponibilidadDelDia.map(d => `${d.horaInicio} a ${d.horaFin}`).join(', ');
    return `Fuera de horario: los días ${DIAS[diaSemana]} se atiende de ${horarios}.`;
  }

  return null;
};

export const getTurnos = async (req: Request, res: Response) => {
  try {
    const { profesionalId, fechaInicio, fechaFin } = req.query;
    
    // Si es PROFESIONAL, forzar que solo vea los suyos
    const filterProfesionalId = req.user?.rol === 'PROFESIONAL' ? req.user.profesionalId : profesionalId;

    const turnos = await prisma.turno.findMany({
      where: {
        paciente: { centroMedicoId: req.user?.centroMedicoId },
        ...(filterProfesionalId ? { profesionalId: String(filterProfesionalId) } : {}),
        ...(fechaInicio && fechaFin ? {
          fechaHoraInicio: {
            gte: new Date(String(fechaInicio)),
            lte: new Date(String(fechaFin))
          }
        } : {})
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true, dni: true } },
        profesional: { select: { id: true, nombre: true, apellido: true } },
        pago: true,
        evolucion: { select: { id: true } }
      },
      orderBy: { fechaHoraInicio: 'asc' }
    });

    res.json(turnos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener turnos' });
  }
};

export const createTurno = async (req: Request, res: Response) => {
  try {
    const { pacienteId, fechaHoraInicio, fechaHoraFin, esSobreturno, motivoConsulta } = req.body;
    const profesionalId = req.body.profesionalId || req.user?.profesionalId;

    if (!profesionalId) {
      return res.status(400).json({ message: 'Error: No se pudo identificar al profesional (profesionalId es requerido).' });
    }

    const inicio = new Date(fechaHoraInicio);
    const fin = new Date(fechaHoraFin);
    const ahora = new Date();

    // 1. Control Exhaustivo: No permitir turnos en el pasado
    if (inicio < ahora) {
      return res.status(400).json({ message: 'No se pueden agendar turnos con fecha u hora vencida (en el pasado).' });
    }

    // 2. Control Exhaustivo: Lógica de tiempo (Fin > Inicio)
    if (fin <= inicio) {
      return res.status(400).json({ message: 'La hora de finalización debe ser estrictamente posterior a la hora de inicio.' });
    }

    // 3. Control Exhaustivo: Respetar la disponibilidad horaria del profesional
    if (!esSobreturno) {
      const errorDisponibilidad = await validarDisponibilidadHoraria(profesionalId, inicio, fin);
      if (errorDisponibilidad) {
        return res.status(400).json({ message: errorDisponibilidad });
      }
    }

    // 4. Control Exhaustivo: Validar Solapamientos
    if (!esSobreturno) {
      const solapamiento = await prisma.turno.findFirst({
        where: {
          profesionalId,
          estado: { notIn: ['CANCELADO', 'AUSENTE'] },
          AND: [
            { fechaHoraInicio: { lt: fin } },
            { fechaHoraFin: { gt: inicio } }
          ]
        }
      });

      if (solapamiento) {
        return res.status(400).json({ message: 'Incompatibilidad de agenda: El horario seleccionado se solapa con otro turno confirmado.' });
      }
    }

    const turno = await prisma.turno.create({
      data: {
        pacienteId,
        profesionalId,
        fechaHoraInicio: inicio,
        fechaHoraFin: fin,
        esSobreturno: esSobreturno || false,
        motivoConsulta
      }
    });

    res.status(201).json(turno);
  } catch (error) {
    console.error('Error creando turno:', error);
    res.status(500).json({ message: 'Error al crear turno' });
  }
};

export const updateEstadoTurno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { estado } = req.body; // EstadoTurno
    const sudoPassword = req.headers['x-sudo-password'] as string;

    const turnoExistente = await prisma.turno.findUnique({ where: { id } });
    if (!turnoExistente) return res.status(404).json({ message: 'Turno no encontrado' });

    // Validar lógicamente que no se finalice un turno futuro
    if (estado === 'FINALIZADO') {
      if (new Date(turnoExistente.fechaHoraInicio) > new Date()) {
        return res.status(400).json({ message: 'Incoherencia temporal: No se puede marcar como finalizado un turno que aún no ha ocurrido.' });
      }
    }

    // Validar si intenta cancelar un turno que ya estaba finalizado (operación crítica)
    if (turnoExistente.estado === 'FINALIZADO' && estado === 'CANCELADO') {
      const userId = req.user?.usuarioId;
      if (!userId) return res.status(401).json({ message: 'No autenticado' });
      const result = await verifySudoPassword(userId, sudoPassword);
      if (!result.valid) {
        return res.status(403).json({ message: result.reason, detail: result.detail });
      }
    }

    const turno = await prisma.turno.update({
      where: { id },
      data: { estado: estado as EstadoTurno }
    });

    res.json(turno);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado del turno' });
  }
};

export const updateTurno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { fechaHoraInicio, fechaHoraFin, esSobreturno, motivoConsulta } = req.body;

    const turnoExistente = await prisma.turno.findUnique({ where: { id } });
    if (!turnoExistente) return res.status(404).json({ message: 'Turno no encontrado' });

    const inicio = fechaHoraInicio ? new Date(fechaHoraInicio) : turnoExistente.fechaHoraInicio;
    const fin = fechaHoraFin ? new Date(fechaHoraFin) : turnoExistente.fechaHoraFin;
    const ahora = new Date();

    // 1. Control Exhaustivo: Lógica de tiempo
    if (fin <= inicio) {
      return res.status(400).json({ message: 'La hora de finalización debe ser estrictamente posterior a la hora de inicio.' });
    }

    // 2. Control Exhaustivo: Evitar arrastrar o reprogramar hacia el pasado
    // Solo validamos esto si el usuario efectivamente intentó cambiar la fecha/hora de inicio
    if (fechaHoraInicio && inicio.getTime() !== turnoExistente.fechaHoraInicio.getTime()) {
      if (inicio < ahora) {
        return res.status(400).json({ message: 'No se puede reprogramar un turno hacia una fecha u hora vencida.' });
      }
    }

    // 3. Control Exhaustivo: Respetar la disponibilidad horaria y validar Solapamientos (ignorando a sí mismo)
    const evaluarSobreturno = esSobreturno !== undefined ? esSobreturno : turnoExistente.esSobreturno;
    if (!evaluarSobreturno) {
      const errorDisponibilidad = await validarDisponibilidadHoraria(turnoExistente.profesionalId, inicio, fin);
      if (errorDisponibilidad) {
        return res.status(400).json({ message: errorDisponibilidad });
      }

      const solapamiento = await prisma.turno.findFirst({
        where: {
          profesionalId: turnoExistente.profesionalId,
          id: { not: id },
          estado: { notIn: ['CANCELADO', 'AUSENTE'] },
          AND: [
            { fechaHoraInicio: { lt: fin } },
            { fechaHoraFin: { gt: inicio } }
          ]
        }
      });

      if (solapamiento) {
        return res.status(400).json({ message: 'Incompatibilidad de agenda: El nuevo horario se solapa con otro turno ya confirmado.' });
      }
    }

    const turnoActualizado = await prisma.turno.update({
      where: { id },
      data: {
        ...(fechaHoraInicio && { fechaHoraInicio: inicio }),
        ...(fechaHoraFin && { fechaHoraFin: fin }),
        ...(esSobreturno !== undefined && { esSobreturno }),
        ...(motivoConsulta !== undefined && { motivoConsulta })
      }
    });

    res.json(turnoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar turno' });
  }
};

export const deleteTurno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const sudoPassword = req.headers['x-sudo-password'] as string;

    const turnoExistente = await prisma.turno.findUnique({ where: { id } });
    if (!turnoExistente) return res.status(404).json({ message: 'Turno no encontrado' });

    // Validar si intenta eliminar un turno finalizado (operación crítica)
    if (turnoExistente.estado === 'FINALIZADO') {
      const userId = req.user?.usuarioId;
      if (!userId) return res.status(401).json({ message: 'No autenticado' });
      const result = await verifySudoPassword(userId, sudoPassword);
      if (!result.valid) {
        return res.status(403).json({ message: result.reason, detail: result.detail });
      }
    }

    await prisma.turno.delete({ where: { id } });
    res.json({ message: 'Turno eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar turno' });
  }
};
