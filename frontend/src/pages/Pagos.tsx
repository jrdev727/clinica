import { useState } from 'react';
import { DollarSign, Receipt, CreditCard, Banknote, X, User } from 'lucide-react';
import { usePagos } from '../hooks/usePagos';
import { usePacientes } from '../hooks/usePacientes';
import { useTurnos } from '../hooks/useTurnos';
import toast from 'react-hot-toast';

export const Pagos = () => {
  const { pagos, isLoading, createPago, isCreating } = usePagos();
  const { pacientes } = usePacientes();
  const { turnos } = useTurnos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pacienteId: '',
    turnoId: '',
    montoTotal: '',
    metodoPago: 'EFECTIVO',
    observaciones: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Cálculos dinámicos
  const turnosPendientes = turnos?.filter((t: any) =>
    t.pacienteId === formData.pacienteId && !t.pago && new Date(t.fechaHoraInicio) <= new Date()
  ) || [];

  const hoy = new Date().setHours(0, 0, 0, 0);
  const ingresosHoy = pagos?.filter((p: any) =>
    new Date(p.createdAt).setHours(0, 0, 0, 0) === hoy && p.estado === 'PAGADO'
  ).reduce((acc: number, p: any) => acc + Number(p.montoTotal), 0) || 0;

  const turnosSinCobrar = turnos?.filter((t: any) =>
    t.estado !== 'CANCELADO' && !t.pago && new Date(t.fechaHoraInicio) <= new Date()
  ).length || 0;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId || !formData.turnoId || !formData.montoTotal) {
      setErrorMsg('Debe seleccionar paciente, turno pendiente y monto.');
      return;
    }
    setErrorMsg('');
    try {
      await createPago({
        ...formData,
        montoTotal: Number(formData.montoTotal)
      });
      setIsModalOpen(false);
      setFormData({ pacienteId: '', turnoId: '', montoTotal: '', metodoPago: 'EFECTIVO', observaciones: '' });
      toast.success('Cobro registrado exitosamente');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al registrar cobro');
      toast.error(err.response?.data?.message || 'Error al registrar cobro');
    }
  };

  const MetodoIcon = ({ metodo }: { metodo: string }) => {
    switch(metodo) {
      case 'EFECTIVO': return <Banknote className="w-4 h-4 text-brand-600" />;
      case 'MERCADO_PAGO': return <DollarSign className="w-4 h-4 text-blue-500" />;
      default: return <CreditCard className="w-4 h-4 text-warm-500" />;
    }
  };

  const formatMetodo = (m: string) => m.replace('_', ' ');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative h-full">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <p className="eyebrow">Caja</p>
          <h2 className="font-serif text-3xl text-warm-900 mt-1">Pagos y Caja</h2>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Receipt className="w-4 h-4" /> Registrar Cobro
        </button>
      </div>

      {/* Franja "de un vistazo" */}
      <div className="surface p-2 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-warm-100">
          <div className="p-6">
            <p className="eyebrow">Ingresos de hoy</p>
            <p className="font-serif text-4xl text-warm-900 mt-2">${ingresosHoy.toLocaleString()}</p>
          </div>
          <div className="p-6">
            <p className="eyebrow">Turnos sin cobrar</p>
            <p className="font-serif text-4xl text-orange-500 mt-2">{turnosSinCobrar}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="surface overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="px-6 py-4 border-b border-warm-100 eyebrow shrink-0">Últimos Movimientos</div>
        <div className="overflow-auto flex-1 p-0">
          {isLoading ? (
             <p className="text-center p-10 text-warm-400 text-sm">Cargando pagos...</p>
          ) : !pagos || pagos.length === 0 ? (
             <p className="text-center p-10 text-warm-400 text-sm">No hay pagos registrados aún.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-warm-50/60 border-b border-warm-200/70 sticky top-0">
                  <th className="th-editorial">Fecha</th>
                  <th className="th-editorial">Paciente</th>
                  <th className="th-editorial">Método</th>
                  <th className="th-editorial text-right">Monto Total</th>
                  <th className="th-editorial text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {pagos.map((pago: any) => (
                  <tr key={pago.id} className="hover:bg-warm-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-warm-500 text-sm">{new Date(pago.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-3.5 font-semibold text-warm-900 text-sm">{pago.paciente?.nombre} {pago.paciente?.apellido}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 text-sm text-warm-600">
                        <MetodoIcon metodo={pago.metodoPago} />
                        <span className="capitalize">{formatMetodo(pago.metodoPago).toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right font-serif text-lg text-warm-900">
                      ${Number(pago.montoTotal).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={pago.estado === 'PAGADO' ? 'badge-success' : 'badge-neutral'}>
                        {pago.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-warm-900/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-warm-lg w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-warm-100 flex justify-between items-center bg-warm-50 shrink-0">
              <h3 className="font-serif text-xl text-warm-900">Registrar Cobro</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-400 hover:text-warm-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4">
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">{errorMsg}</div>}

                <div>
                  <label className="field-label flex items-center gap-2"><User className="w-4 h-4 text-brand-500"/> Paciente</label>
                  <select required className="field-input" value={formData.pacienteId} onChange={e => setFormData({...formData, pacienteId: e.target.value, turnoId: ''})}>
                    <option value="">Seleccione un paciente...</option>
                    {pacientes?.map((p: any) => (<option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>))}
                  </select>
                </div>

                {formData.pacienteId && (
                  <div>
                    <label className="field-label">Turno a Abonar</label>
                    <select required className="field-input" value={formData.turnoId} onChange={e => setFormData({...formData, turnoId: e.target.value})}>
                      <option value="">Seleccione un turno pendiente...</option>
                      {turnosPendientes.map((t: any) => (
                        <option key={t.id} value={t.id}>{new Date(t.fechaHoraInicio).toLocaleString()} - {t.motivoConsulta || 'Consulta General'}</option>
                      ))}
                    </select>
                    {turnosPendientes.length === 0 && <p className="text-xs text-red-500 mt-2">El paciente no tiene turnos impagos que ya hayan ocurrido.</p>}
                  </div>
                )}

                <div>
                  <label className="field-label">Monto Total ($)</label>
                  <input type="number" required min="0" className="field-input" value={formData.montoTotal} onChange={e => setFormData({...formData, montoTotal: e.target.value})} placeholder="Ej: 15000" />
                </div>

                <div>
                  <label className="field-label">Método de Pago</label>
                  <select required className="field-input" value={formData.metodoPago} onChange={e => setFormData({...formData, metodoPago: e.target.value})}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                    <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="MERCADO_PAGO">Mercado Pago</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Observaciones</label>
                  <textarea rows={2} className="field-input resize-none" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} placeholder="Detalles extra (opcional)..." />
                </div>
              </div>

              <div className="p-6 border-t border-warm-100 bg-warm-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Cancelar</button>
                <button type="submit" disabled={isCreating} className="btn-primary">
                  {isCreating ? 'Guardando...' : 'Registrar Cobro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
