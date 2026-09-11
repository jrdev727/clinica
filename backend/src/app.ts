import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Configurar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// Los adjuntos de historias clínicas son confidenciales: se sirven solo vía
// /api/historias-clinicas/adjuntos/:filename (requiere login y respeta las
// mismas reglas de confidencialidad que el resto de la historia clínica).

// Rutas (placeholder)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente.' });
});

import authRoutes from './routes/auth.routes';
import pacientesRoutes from './routes/pacientes.routes';

// app.use('/api/auth', authRoutes);
// app.use('/api/pacientes', pacientesRoutes);
import profesionalesRoutes from './routes/profesionales.routes';
import turnosRoutes from './routes/turnos.routes';
import hcRoutes from './routes/historiasClinicas.routes';
import pagosRoutes from './routes/pagos.routes';
import usuariosRoutes from './routes/usuarios.routes';
import auditoriaRoutes from './routes/auditoria.routes';

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/historias-clinicas', hcRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auditoria', auditoriaRoutes);

export default app;
