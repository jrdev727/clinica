import { useState } from 'react';
import { Search, FileText, UserPlus, FileEdit, Trash2, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePacientes } from '../hooks/usePacientes';
import toast from 'react-hot-toast';
import { promptSudo } from '../utils/sudoPrompt';

export const Pacientes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { pacientes, isLoading, error, createPaciente, updatePaciente, deletePaciente } = usePacientes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    dni: '', nombre: '', apellido: '', fechaNacimiento: '',
    telefono: '', email: '', direccion: '',
    coberturaMedica: '', numeroAfiliado: '', antecedentes: ''
  });

  const pacientesFiltrados = pacientes.filter((p: any) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  );

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedPacienteId(null);
    setFormData({ dni: '', nombre: '', apellido: '', fechaNacimiento: '', telefono: '', email: '', direccion: '', coberturaMedica: '', numeroAfiliado: '', antecedentes: '' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (paciente: any) => {
    setModalMode('edit');
    setSelectedPacienteId(paciente.id);
    setFormData({
      dni: paciente.dni || '', nombre: paciente.nombre || '', apellido: paciente.apellido || '',
      fechaNacimiento: paciente.fechaNacimiento ? paciente.fechaNacimiento.split('T')[0] : '',
      telefono: paciente.telefono || '', email: paciente.email || '', direccion: paciente.direccion || '',
      coberturaMedica: paciente.coberturaMedica || '', numeroAfiliado: paciente.numeroAfiliado || '',
      antecedentes: paciente.antecedentes || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : null,
      };

      if (modalMode === 'create') {
        await createPaciente(payload);
      } else if (modalMode === 'edit' && selectedPacienteId) {
        await updatePaciente({ id: selectedPacienteId, ...payload });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar el paciente');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}? Esta acción borrará todas sus historias clínicas, turnos y pagos.`)) {
      try {
        await deletePaciente({ id });
        toast.success('Paciente eliminado exitosamente');
      } catch (err: any) {
        if (err.response?.data?.message === 'SUDO_REQUIRED' || err.response?.data?.message === 'SUDO_INVALID') {
          const pwd = await promptSudo(err.response.data.detail);
          if (pwd) {
            try {
              await deletePaciente({ id, sudoPassword: pwd });
              toast.success('Paciente eliminado por Sudo');
            } catch (error: any) {
              toast.error(error.response?.data?.detail || 'Contraseña incorrecta');
            }
          }
        } else {
          toast.error(err.response?.data?.message || 'Error al eliminar');
        }
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="eyebrow">{pacientes.length} en total</p>
          <h2 className="font-serif text-3xl text-warm-900 mt-1">Directorio de Pacientes</h2>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Nuevo Paciente
        </button>
      </div>

      <div className="surface p-3 flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-warm-400" />
          </div>
          <input
            type="text"
            className="field-input pl-10 bg-white"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-warm-50/60 border-b border-warm-200/70">
                <th className="th-editorial">Paciente</th>
                <th className="th-editorial">DNI</th>
                <th className="th-editorial">Contacto</th>
                <th className="th-editorial text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center p-8 text-warm-500">Cargando pacientes...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="text-center p-8 text-red-500">Error al cargar pacientes</td></tr>
              ) : pacientesFiltrados.map((p: any) => (
                <tr key={p.id} className="hover:bg-warm-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-warm-100 text-warm-700 flex items-center justify-center font-bold font-serif text-sm uppercase shrink-0">
                        {p.nombre[0]}{p.apellido[0]}
                      </div>
                      <div>
                        <p className="font-bold text-warm-900 text-sm">{p.apellido}, {p.nombre}</p>
                        {p.coberturaMedica && <p className="text-xs text-brand-700 font-semibold">{p.coberturaMedica}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-warm-600 text-sm font-medium">{p.dni}</td>
                  <td className="px-6 py-3.5 text-warm-500 text-sm">
                     {p.telefono && <div>{p.telefono}</div>}
                     {p.email && <div>{p.email}</div>}
                  </td>
                  <td className="px-6 py-3.5 text-right space-x-1">
                    <button onClick={() => navigate('/historias-clinicas', { state: { pacienteId: p.id } })} className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Ver Historia Clínica">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditModal(p)} className="p-2 text-warm-400 hover:text-warm-700 hover:bg-warm-100 rounded-lg transition-colors" title="Editar Paciente">
                      <FileEdit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id, `${p.nombre} ${p.apellido}`)} className="p-2 text-warm-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar Paciente">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && pacientesFiltrados.length === 0 && (
          <div className="p-14 text-center text-warm-400">
            <Users className="w-8 h-8 mx-auto mb-3 text-warm-300" />
            <p className="text-sm">No se encontraron pacientes.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-warm-900/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-warm-lg w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
            <div className="p-6 border-b border-warm-100 flex justify-between items-center bg-warm-50 shrink-0">
              <h3 className="font-serif text-xl text-warm-900">
                {modalMode === 'create' ? 'Registrar Nuevo Paciente' : 'Editar Ficha del Paciente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-400 hover:text-warm-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">{errorMsg}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Nombre *</label>
                    <input type="text" required className="field-input" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div>
                    <label className="field-label">Apellido *</label>
                    <input type="text" required className="field-input" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                  </div>
                  <div>
                    <label className="field-label">DNI *</label>
                    <input type="text" required className="field-input" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
                  </div>
                  <div>
                    <label className="field-label">Fecha de Nacimiento</label>
                    <input type="date" className="field-input" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} />
                  </div>
                  <div>
                    <label className="field-label">Teléfono</label>
                    <input type="text" className="field-input" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                  </div>
                  <div>
                    <label className="field-label">Email</label>
                    <input type="email" className="field-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="field-label">Dirección</label>
                    <input type="text" className="field-input" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                  </div>
                </div>

                <div className="bg-warm-50 p-4 rounded-xl border border-warm-100 space-y-4">
                  <p className="eyebrow">Cobertura (opcional)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="field-label text-xs">Obra Social / Prepaga</label>
                      <input type="text" className="field-input bg-white" value={formData.coberturaMedica} onChange={e => setFormData({...formData, coberturaMedica: e.target.value})} />
                    </div>
                    <div>
                      <label className="field-label text-xs">Nro de Afiliado</label>
                      <input type="text" className="field-input bg-white" value={formData.numeroAfiliado} onChange={e => setFormData({...formData, numeroAfiliado: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="field-label">Antecedentes Clínicos / Notas</label>
                  <textarea rows={3} className="field-input resize-none" value={formData.antecedentes} onChange={e => setFormData({...formData, antecedentes: e.target.value})} />
                </div>
              </div>

              <div className="p-6 border-t border-warm-100 bg-warm-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-primary">
                  {modalMode === 'create' ? 'Guardar Paciente' : 'Actualizar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
