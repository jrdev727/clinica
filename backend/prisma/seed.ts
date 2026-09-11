import { PrismaClient, RolUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seed...');

  // 1. Crear el Centro Médico
  const centroMedico = await prisma.centroMedico.create({
    data: {
      nombre: 'Centro Médico Integral',
      cuit: '30-12345678-9',
      direccion: 'Av. Principal 1234',
      telefono: '1122334455',
    },
  });

  console.log(`Centro Médico creado con ID: ${centroMedico.id}`);

  // 2. Crear el Usuario Administrador/Psicóloga
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const usuario = await prisma.usuario.create({
    data: {
      centroMedicoId: centroMedico.id,
      username: 'psicologa',
      email: 'psicologia@clinica.com',
      passwordHash,
      rol: RolUsuario.ADMIN, // Le damos rol ADMIN como pedía el prompt
      activo: true,
      profesional: {
        create: {
          nombre: 'Dra. María',
          apellido: 'Psicóloga',
          especialidad: 'Psicología Clínica',
          matricula: 'MP-1234',
          duracionTurnoMin: 45,
          porcentajeComision: 100.0,
        },
      },
    },
    include: {
      profesional: true,
    },
  });

  console.log(`Usuario creado: ${usuario.email}`);
  
  if (usuario.profesional) {
     // 3. Crear disponibilidad horaria
     await prisma.disponibilidadHoraria.createMany({
       data: [
         {
           profesionalId: usuario.profesional.id,
           diaSemana: 1, // Lunes
           horaInicio: '09:00',
           horaFin: '18:00'
         },
         {
           profesionalId: usuario.profesional.id,
           diaSemana: 2, // Martes
           horaInicio: '09:00',
           horaFin: '18:00'
         },
         {
           profesionalId: usuario.profesional.id,
           diaSemana: 3, // Miércoles
           horaInicio: '09:00',
           horaFin: '18:00'
         }
       ]
     });
     console.log('Disponibilidad horaria configurada.');
  }

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
