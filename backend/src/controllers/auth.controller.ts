import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { JWT_SECRET } from '../lib/env';

type UsuarioConNombre = {
  nombre?: string | null;
  apellido?: string | null;
  profesional?: { nombre: string; apellido: string } | null;
};

const nombreParaMostrar = (usuario: UsuarioConNombre) => {
  if (usuario.profesional) return `${usuario.profesional.nombre} ${usuario.profesional.apellido}`;
  if (usuario.nombre) return `${usuario.nombre} ${usuario.apellido || ''}`.trim();
  return 'Admin/Recepción';
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { username },
      include: { profesional: true }
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const payload = {
      usuarioId: usuario.id,
      centroMedicoId: usuario.centroMedicoId,
      rol: usuario.rol,
      profesionalId: usuario.profesional?.id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: nombreParaMostrar(usuario)
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return res.status(401).json({ message: 'No autorizado' });

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { profesional: true, centroMedico: true }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: nombreParaMostrar(usuario),
      centroMedico: usuario.centroMedico.nombre,
      profesional: usuario.profesional
    });
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
