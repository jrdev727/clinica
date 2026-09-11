import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EstadoPago, MetodoPago } from '@prisma/client';

export const registrarCobro = async (req: Request, res: Response) => {
  try {
    const { pacienteId, turnoId, montoTotal, montoCopago, montoCobertura, metodoPago, comprobanteNro, observaciones } = req.body;

    if (!turnoId) {
      return res.status(400).json({ message: 'Todo pago debe estar estrictamente vinculado a un Turno.' });
    }

    // Validaciones estrictas del Turno
    const turno = await prisma.turno.findUnique({
      where: { id: turnoId },
      include: { pago: true }
    });

    if (!turno) {
      return res.status(404).json({ message: 'El turno especificado no existe.' });
    }

    if (turno.pacienteId !== pacienteId) {
      return res.status(400).json({ message: 'Inconsistencia: El turno no pertenece al paciente seleccionado.' });
    }

    if (turno.pago) {
      return res.status(400).json({ message: 'Control Antifraude: Este turno ya registra un pago asociado. No se permiten pagos dobles.' });
    }

    if (new Date(turno.fechaHoraInicio) > new Date()) {
      return res.status(400).json({ message: 'Control de Flujo: No se pueden registrar cobros de consultas que aún no han ocurrido.' });
    }

    const pago = await prisma.pago.create({
      data: {
        pacienteId,
        turnoId,
        montoTotal,
        montoCopago,
        montoCobertura,
        metodoPago: metodoPago as MetodoPago,
        comprobanteNro,
        observaciones,
        estado: EstadoPago.PAGADO
      }
    });

    res.status(201).json(pago);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar cobro' });
  }
};

export const getPagos = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const pagos = await prisma.pago.findMany({
      where: {
        paciente: { centroMedicoId: req.user?.centroMedicoId },
        ...(fechaInicio && fechaFin ? {
          createdAt: {
            gte: new Date(String(fechaInicio)),
            lte: new Date(String(fechaFin))
          }
        } : {})
      },
      include: {
        paciente: { select: { nombre: true, apellido: true, dni: true } },
        turno: { select: { fechaHoraInicio: true, profesional: { select: { nombre: true, apellido: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pagos' });
  }
};
