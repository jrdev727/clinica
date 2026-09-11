import React, { useState } from 'react';
import toast, { type Toast } from 'react-hot-toast';
import { Lock, X, Check } from 'lucide-react';

interface SudoToastProps {
  t: Toast;
  detail: string;
  onResolve: (password: string | null) => void;
}

const SudoToastContent: React.FC<SudoToastProps> = ({ t, detail, onResolve }) => {
  const [pwd, setPwd] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd) return;
    toast.dismiss(t.id);
    onResolve(pwd);
  };

  const handleCancel = () => {
    toast.dismiss(t.id);
    onResolve(null);
  };

  return (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-warm-lg rounded-2xl pointer-events-auto flex flex-col border border-red-100 overflow-hidden`}>
      <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3">
        <div className="bg-red-100 text-red-600 p-2 rounded-full shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg text-red-800">Acción Crítica</h3>
          <p className="text-red-600 text-sm mt-1">{detail}</p>
        </div>
        <button onClick={handleCancel} className="text-red-400 hover:text-red-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white flex flex-col gap-3">
        <p className="text-warm-600 text-sm font-medium">Ingresá tu contraseña para autorizar:</p>
        <input
          type="password"
          autoFocus
          className="w-full px-4 py-2 border border-warm-200 rounded-xl focus:ring-2 focus:ring-red-400/40 focus:border-red-400 outline-none text-warm-900"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Tu contraseña..."
        />
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={handleCancel} className="btn-ghost text-sm py-2">
            Cancelar
          </button>
          <button type="submit" disabled={!pwd} className="btn-danger text-sm py-2">
            <Check className="w-4 h-4" /> Autorizar
          </button>
        </div>
      </form>
    </div>
  );
};

export const promptSudo = (detail: string): Promise<string | null> => {
  return new Promise((resolve) => {
    toast.custom(
      (t) => <SudoToastContent t={t} detail={detail} onResolve={resolve} />,
      { 
        duration: Infinity, 
        position: 'top-center',
      }
    );
  });
};
