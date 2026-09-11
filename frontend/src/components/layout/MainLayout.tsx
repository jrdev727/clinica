import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, CreditCard, LogOut, UserCog, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ROLES_LABEL: Record<string, string> = {
  ADMIN: 'Administrador/a',
  PROFESIONAL: 'Profesional',
  RECEPCION: 'Recepción',
};

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/turnos', label: 'Turnos', icon: Calendar },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/historias-clinicas', label: 'Historias Clínicas', icon: FileText },
  { to: '/pagos', label: 'Pagos y Caja', icon: CreditCard },
];

const NAV_ITEMS_ADMIN: NavItem[] = [
  { to: '/usuarios', label: 'Equipo', icon: UserCog },
  { to: '/auditoria', label: 'Auditoría', icon: ShieldCheck },
];

export const MainLayout = () => {
  const token = localStorage.getItem('token');
  const { logout } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const usuario = JSON.parse(localStorage.getItem('user') || 'null');
  const nombre = usuario?.nombre || 'Usuario';
  const rolLabel = ROLES_LABEL[usuario?.rol] || usuario?.rol || '';
  const iniciales = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra: string) => palabra[0])
    .join('')
    .toUpperCase();

  const items = usuario?.rol === 'ADMIN' ? [...NAV_ITEMS, ...NAV_ITEMS_ADMIN] : NAV_ITEMS;
  const paginaActual = items.find(i => i.end ? location.pathname === i.to : location.pathname.startsWith(i.to));

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-warm-900 text-warm-300 flex flex-col shrink-0">
        <div className="px-6 py-7 flex items-center gap-3">
          <svg viewBox="0 0 64 64" className="w-9 h-9 shrink-0">
            <rect width="64" height="64" rx="16" fill="#754d3d" />
            <path d="M32 14c-8.5 6-13 13.2-13 20.2C19 41.9 24.8 48 32 48s13-6.1 13-13.8c0-7-4.5-14.2-13-20.2Z" fill="none" stroke="#f2ece4" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M32 22c-4.6 3.6-7 7.7-7 11.4 0 4.4 3.1 8 7 8s7-3.6 7-8c0-3.7-2.4-7.8-7-11.4Z" fill="#408f90" />
          </svg>
          <div>
            <h2 className="font-serif text-xl text-white leading-none">EMUNÁ</h2>
            <p className="text-[10px] text-warm-400 mt-1.5 uppercase tracking-[0.18em] font-bold">Salud Integral</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 mt-4">
          <p className="eyebrow text-warm-500 px-3 mb-2">Menú</p>
          {items.map(({ to, label, icon: Icon, end }) => {
            const activo = end ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[0.9rem] ${
                  activo ? 'bg-warm-800 text-white font-semibold' : 'text-warm-300 hover:bg-warm-800/60 hover:text-white'
                }`}
              >
                {activo && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-400" />}
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={activo ? 2.3 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-2 border-t border-warm-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-warm-400 hover:bg-warm-800/60 hover:text-red-300 w-full rounded-xl transition-all text-[0.9rem]"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-warm-50 bg-grain">
        <header className="bg-white/70 backdrop-blur-sm px-8 py-4 border-b border-warm-200/70 flex items-center justify-between">
          <p className="font-serif text-lg text-warm-800">{paginaActual?.label || 'EMUNÁ'}</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-warm-200 flex items-center justify-center text-warm-700 font-bold text-sm shrink-0">
              {iniciales || '?'}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-warm-900">{nombre}</p>
              <p className="text-xs text-warm-500">{rolLabel}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
