import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pacientes } from './pages/Pacientes';
import { HistoriasClinicas } from './pages/HistoriasClinicas';
import { Pagos } from './pages/Pagos';
import { Turnos } from './pages/Turnos';
import { Usuarios } from './pages/Usuarios';
import { Auditoria } from './pages/Auditoria';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/turnos" element={<Turnos />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/historias-clinicas" element={<HistoriasClinicas />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/auditoria" element={<Auditoria />} />
          {/* Futuras rutas irán aquí */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
