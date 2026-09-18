-- CreateTable
CREATE TABLE "Derivacion" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profesionalOrigenId" TEXT NOT NULL,
    "profesionalDestinoId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "adjunto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Derivacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Derivacion" ADD CONSTRAINT "Derivacion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Derivacion" ADD CONSTRAINT "Derivacion_profesionalOrigenId_fkey" FOREIGN KEY ("profesionalOrigenId") REFERENCES "Profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Derivacion" ADD CONSTRAINT "Derivacion_profesionalDestinoId_fkey" FOREIGN KEY ("profesionalDestinoId") REFERENCES "Profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
