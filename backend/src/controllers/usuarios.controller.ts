import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma, RolUsuario } from '@prisma/client';
import { prisma } from '../lib/prisma';

const ROLES_CREABLES: RolUsuario[] = [RolUsuario.PROFESIONAL, RolUsuario.RECEPCION];

const usuarioSelect = {
  id: true,
  username: true,
  email: true,
  rol: true,
  activo: true,
  nombre: true,
  apellido: true,
  createdAt: true,
  profesional: {
    select: {
      id: true,
      nombre: true,
      apellido: true,
      especialidad: true,
      matricula: true,
      duracionTurnoMin: true,
      porcentajeComision: true,
      disponibilidades: {
        select: { id: true, diaSemana: true, horaInicio: true, horaFin: true },
      },
    },
  },
} satisfies Prisma.UsuarioSelect;

export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const centroMedicoId = req.user?.centroMedicoId;

    const usuarios = await prisma.usuario.findMany({
      where: { centroMedicoId },
      select: usuarioSelect,
      orderBy: { createdAt: 'asc' },
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

export const createUsuario = async (req: Request, res: Response) => {
  try {
    const centroMedicoId = req.user?.centroMedicoId!;
    const { username, password, email, rol, nombre, apellido, especialidad, matricula, duracionTurnoMin, porcentajeComision } = req.body;

    if (!username || !password || !rol) {
      return res.status(400).json({ message: 'Usuario, contraseña y rol son obligatorios' });
    }

    if (!ROLES_CREABLES.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido. Solo se pueden crear usuarios Profesional o Recepción.' });
    }

    if (!nombre || !apellido) {
      return res.status(400).json({ message: 'Nombre y apellido son obligatorios' });
    }

    if (rol === RolUsuario.PROFESIONAL && !especialidad) {
      return res.status(400).json({ message: 'La especialidad es obligatoria para un Profesional' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        centroMedicoId,
        username,
        email: email || null,
        passwordHash,
        rol,
        nombre,
        apellido,
        ...(rol === RolUsuario.PROFESIONAL
          ? {
              profesional: {
                create: {
                  nombre,
                  apellido,
                  especialidad,
                  matricula: matricula || null,
                  duracionTurnoMin: duracionTurnoMin ? Number(duracionTurnoMin) : 45,
                  porcentajeComision: porcentajeComision !== undefined ? Number(porcentajeComision) : 100,
                },
              },
            }
          : {}),
      },
      select: usuarioSelect,
    });

    res.status(201).json(usuario);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({ message: 'El nombre de usuario o email ya está en uso' });
    }
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const centroMedicoId = req.user?.centroMedicoId;
    const { email, nombre, apellido, especialidad, matricula, duracionTurnoMin, porcentajeComision, nuevaPassword } = req.body;

    const usuario = await prisma.usuario.findFirst({
      where: { id, centroMedicoId },
      include: { profesional: true },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const dataUsuario: Prisma.UsuarioUpdateInput = {
      email: email ?? undefined,
      nombre: nombre ?? undefined,
      apellido: apellido ?? undefined,
    };

    if (nuevaPassword) {
      dataUsuario.passwordHash = await bcrypt.hash(nuevaPassword, 10);
    }

    if (usuario.profesional) {
      dataUsuario.profesional = {
        update: {
          nombre: nombre ?? undefined,
          apellido: apellido ?? undefined,
          especialidad: especialidad ?? undefined,
          matricula: matricula ?? undefined,
          duracionTurnoMin: duracionTurnoMin !== undefined ? Number(duracionTurnoMin) : undefined,
          porcentajeComision: porcentajeComision !== undefined ? Number(porcentajeComision) : undefined,
        },
      };
    }

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: dataUsuario,
      select: usuarioSelect,
    });

    res.json(actualizado);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(400).json({ message: 'El email ya está en uso por otro usuario' });
    }
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

export const toggleEstadoUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const centroMedicoId = req.user?.centroMedicoId;

    if (id === req.user?.usuarioId) {
      return res.status(400).json({ message: 'No podés activar/desactivar tu propio usuario' });
    }

    const usuario = await prisma.usuario.findFirst({ where: { id, centroMedicoId } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: { activo: !usuario.activo },
      select: usuarioSelect,
    });

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar el estado del usuario' });
  }
};
