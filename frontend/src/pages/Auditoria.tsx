import { Fragment, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuditoria } from '../hooks/useAuditoria';

export const Auditoria = () => {
  const { logs, isLoading, error } = useAuditoria();
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const nombreUsuario = (log: any) => {
    if (!log.usuario) return 'Usuario eliminado';
    if (log.usuario.profesional) return `${log.usuario.profesional.nombre} ${log.usuario.profesional.apellido}`;
    if (log.usuario.nombre) return `${log.usuario.nombre} ${log.usuario.apellido || ''}`.trim();
    return log.usuario.username;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <p className="eyebrow">{logs.length} registros</p>
        <h2 className="font-serif text-3xl text-warm-900 mt-1">Auditoría</h2>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-warm-50/60 border-b border-warm-200/70">
                <th className="th-editorial">Fecha</th>
                <th className="th-editorial">Usuario</th>
                <th className="th-editorial">Acción</th>
                <th className="th-editorial">Entidad</th>
                <th className="th-editorial">IP</th>
                <th className="th-editorial"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-8 text-warm-500">Cargando auditoría...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="text-center p-8 text-red-500">Error al cargar la auditoría</td></tr>
              ) : logs.map((log: any) => (
                <Fragment key={log.id}>
                  <tr className="hover:bg-warm-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-warm-500 text-sm whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-semibold text-warm-900 text-sm">{nombreUsuario(log)}</td>
                    <td className="px-6 py-3.5 text-warm-700 text-sm">{log.accion}</td>
                    <td className="px-6 py-3.5"><span className="badge-neutral">{log.entidad}</span></td>
                    <td className="px-6 py-3.5 text-warm-400 text-xs font-mono">{log.ipAddress || '—'}</td>
                    <td className="px-6 py-3.5 text-right">
                      {log.detalles && (
                        <button onClick={() => setExpandidoId(expandidoId === log.id ? null : log.id)} className="p-1 text-warm-400 hover:text-warm-700">
                          {expandidoId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandidoId === log.id && log.detalles && (
                    <tr>
                      <td colSpan={6} className="px-6 py-3 bg-warm-50/50">
                        <pre className="text-xs text-warm-600 whitespace-pre-wrap break-all font-mono">{log.detalles}</pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && logs.length === 0 && (
          <div className="p-14 text-center text-warm-400 text-sm">Todavía no hay actividad registrada.</div>
        )}
      </div>
    </div>
  );
};
