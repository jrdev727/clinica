import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Nunca debe quedar una contraseña en texto plano en el registro de auditoría
const CAMPOS_SENSIBLES = ['password', 'nuevaPassword', 'passwordHash', 'sudoPassword'];

const ocultarCamposSensibles = (body: any) => {
  if (!body || typeof body !== 'object') return body;
  const copia: any = { ...body };
  for (const campo of CAMPOS_SENSIBLES) {
    if (campo in copia) copia[campo] = '[OCULTO]';
  }
  return copia;
};

export const auditMiddleware = (entidad: string, accion: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Interceptamos la respuesta para loguear solo si fue exitosa (200-299)
    const originalSend = res.send;
    
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Enviar a segundo plano la auditoría
        const usuarioId = req.user?.usuarioId || null;
        let detalles = '';
        
        try {
           if (req.method !== 'GET') {
               detalles = JSON.stringify(ocultarCamposSensibles(req.body));
           }
        } catch(e) {}

        prisma.auditoriaLog.create({
          data: {
            usuarioId,
            accion: `${req.method} ${accion}`,
            entidad,
            detalles,
            ipAddress: req.ip || req.socket.remoteAddress
          }
        }).catch(err => console.error('Error al guardar auditoría:', err));
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
};
