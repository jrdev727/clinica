-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'PROFESIONAL', 'RECEPCION');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PROGRAMADO', 'CONFIRMADO', 'EN_ESPERA', 'EN_ATENCION', 'FINALIZADO', 'CANCELADO', 'AUSENTE');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'MERCADO_PAGO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'ANULADO');

-- CreateTable
CREATE TABLE "CentroMedico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuit" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CentroMedico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "centroMedicoId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'PROFESIONAL',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "nombre" TEXT,
    "apellido" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profesional" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "matricula" TEXT,
    "especialidad" TEXT NOT NULL,
    "duracionTurnoMin" INTEGER NOT NULL DEFAULT 45,
    "porcentajeComision" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisponibilidadHoraria" (
    "id" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,

    CONSTRAINT "DisponibilidadHoraria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "centroMedicoId" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "coberturaMedica" TEXT,
    "numeroAfiliado" TEXT,
    "antecedentes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'PROGRAMADO',
    "esSobreturno" BOOLEAN NOT NULL DEFAULT false,
    "motivoConsulta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvolucionClinica" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "turnoId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivoConsulta" TEXT,
    "notaClinica" TEXT NOT NULL,
    "diagnostico" TEXT,
    "planTratamiento" TEXT,
    "adjuntos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "esConfidencial" BOOLEAN NOT NULL DEFAULT true,
    "estaFirmada" BOOLEAN NOT NULL DEFAULT false,
    "firmadaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvolucionClinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "turnoId" TEXT,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "montoCopago" DECIMAL(10,2),
    "montoCobertura" DECIMAL(10,2),
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "estado" "EstadoPago" NOT NULL DEFAULT 'PAGADO',
    "comprobanteNro" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditoriaLog" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalles" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditoriaLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_usuarioId_key" ON "Profesional"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_centroMedicoId_dni_key" ON "Paciente"("centroMedicoId", "dni");

-- CreateIndex
CREATE UNIQUE INDEX "EvolucionClinica_turnoId_key" ON "EvolucionClinica"("turnoId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_turnoId_key" ON "Pago"("turnoId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_centroMedicoId_fkey" FOREIGN KEY ("centroMedicoId") REFERENCES "CentroMedico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisponibilidadHoraria" ADD CONSTRAINT "DisponibilidadHoraria_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_centroMedicoId_fkey" FOREIGN KEY ("centroMedicoId") REFERENCES "CentroMedico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolucionClinica" ADD CONSTRAINT "EvolucionClinica_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolucionClinica" ADD CONSTRAINT "EvolucionClinica_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvolucionClinica" ADD CONSTRAINT "EvolucionClinica_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditoriaLog" ADD CONSTRAINT "AuditoriaLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
