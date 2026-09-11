import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex bg-warm-50 bg-grain">
      {/* Panel editorial: solo visible desde tablet en adelante */}
      <div className="hidden lg:flex lg:w-[44%] relative bg-warm-900 text-warm-50 flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative">
          <p className="eyebrow text-warm-300">Sistema de gestión clínica</p>
          <h1 className="font-serif text-5xl mt-3 leading-[1.1]">EMUNÁ</h1>
          <p className="text-warm-300 text-sm mt-2 tracking-[0.2em] uppercase">Salud Integral</p>
        </div>
        <blockquote className="relative border-l-2 border-brand-500/60 pl-5">
          <p className="font-serif text-2xl italic leading-snug text-warm-100">
            "Entre el estímulo y la respuesta hay un espacio. En ese espacio está nuestro poder de elegir."
          </p>
          <p className="text-warm-400 text-sm mt-3">— Viktor Frankl</p>
        </blockquote>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="lg:hidden mb-10 text-center">
            <h1 className="font-serif text-4xl text-warm-900">EMUNÁ</h1>
            <p className="text-warm-500 text-xs mt-1 tracking-[0.2em] uppercase">Salud Integral</p>
          </div>

          <h2 className="font-serif text-2xl text-warm-900 mb-1">Bienvenida de vuelta</h2>
          <p className="text-warm-500 text-sm mb-8">Ingresá tus credenciales para acceder al sistema.</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="field-label">Nombre de usuario</label>
              <input
                type="text"
                className="field-input"
                placeholder="Ej: psicologa"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="field-label">Contraseña</label>
              <input
                type="password"
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button disabled={isLoading} type="submit" className="btn-primary w-full py-3 mt-2">
              {isLoading ? 'Ingresando...' : 'Ingresar a mi cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
