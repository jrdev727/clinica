import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';

export const getDerivacionesPaciente = async (req: Request, res: Response) => {
  try {
    const { pacienteId } = req.params as { pacienteId: string };
    const { rol, centroMedicoId } = req.user!;

    // Misma regla de confidencialidad que el resto de la historia clínica
    if (rol === 'RECEPCION') {
      return res.status(403).json({ message: 'Acceso denegado: Confidencialidad médica' });
    }

    const derivaciones = await prisma.derivacion.findMany({
      where: { pacienteId, paciente: { centroMedicoId } },
      include: {
        profesionalOrigen: { select: { nombre: true, apellido: true, especialidad: true } },
        profesionalDestino: { select: { nombre: true, apellido: true, especialidad: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(derivaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener derivaciones' });
  }
};

export const createDerivacion = async (req: Request, res: Response) => {
  try {
    const { pacienteId, profesionalDestinoId, motivo } = req.body;
    const { rol, profesionalId, centroMedicoId } = req.user!;

    if (!profesionalId || (rol !== 'PROFESIONAL' && rol !== 'ADMIN')) {
      return res.status(403).json({ message: 'Solo los perfiles profesionales autorizados pueden derivar pacientes' });
    }

    if (!pacienteId || !profesionalDestinoId || !motivo) {
      return res.status(400).json({ message: 'Paciente, profesional destino y motivo son obligatorios' });
    }

    if (profesionalDestinoId === profesionalId) {
      return res.status(400).json({ message: 'No podés derivar un paciente a vos mismo/a' });
    }

    const paciente = await prisma.paciente.findFirst({ where: { id: pacienteId, centroMedicoId } });
    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const destino = await prisma.profesional.findFirst({
      where: { id: profesionalDestinoId, usuario: { centroMedicoId, activo: true } }
    });
    if (!destino) {
      return res.status(404).json({ message: 'Profesional destino no encontrado' });
    }

    const adjunto = req.file ? `/uploads/${req.file.filename}` : null;

    const derivacion = await prisma.derivacion.create({
      data: {
        pacienteId,
        profesionalOrigenId: profesionalId,
        profesionalDestinoId,
        motivo,
        adjunto
      },
      include: {
        profesionalOrigen: { select: { nombre: true, apellido: true, especialidad: true } },
        profesionalDestino: { select: { nombre: true, apellido: true, especialidad: true } }
      }
    });

    res.status(201).json(derivacion);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la derivación' });
  }
};

export const getAdjuntoDerivacion = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params as { filename: string };
    const { rol, centroMedicoId } = req.user!;

    if (rol === 'RECEPCION') {
      return res.status(403).json({ message: 'Acceso denegado: Confidencialidad médica' });
    }

    const rutaRelativa = `/uploads/${filename}`;
    const derivacion = await prisma.derivacion.findFirst({
      where: { adjunto: rutaRelativa, paciente: { centroMedicoId } }
    });

    if (!derivacion) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const nombreSeguro = path.basename(filename);
    const rutaArchivo = path.join(process.cwd(), 'uploads', nombreSeguro);

    if (!fs.existsSync(rutaArchivo)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }

    res.sendFile(rutaArchivo);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el archivo' });
  }
};
